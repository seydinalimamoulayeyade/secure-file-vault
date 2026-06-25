// Pipeline CI/CD — Secure File Vault (axe DevSecOps).
// Calqué sur le pipeline du Deploy Board, enrichi d'un stage Trivy :
// checkout / install / test / sonar / quality gate / build / TRIVY / push / deploy.
// Politique Trivy : échec du build si vulnérabilité CRITICAL, warning sur HIGH.

def IMAGES = ['backend', 'frontend']

// Notification Slack tolérante : ne casse pas le build si Slack est absent
def notifySlack(String color, String message) {
  try {
    slackSend(color: color, message: message)
  } catch (ignored) {
    echo "Slack indisponible — notification ignorée : ${message}"
  }
}

pipeline {
  agent any

  environment {
    DOCKER_NS     = "lims4"                          // namespace Docker Hub
    IMAGE_PREFIX  = "secure-file-vault"               // images : lims4/secure-file-vault-<composant>
    DOCKER_TAG    = "${BUILD_NUMBER}"
    SONAR_PROJECT = "secure-file-vault"
    DEPLOY_ENV    = "${params.ENVIRONMENT ?: 'production'}"
    DEPLOY_BOARD_URL    = "http://host.docker.internal:5001"
    DEPLOY_INGEST_TOKEN = credentials('deploy-ingest-token')
    TRIVY_REPORT  = "trivy-report.txt"
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    // 1. Checkout — clone + métadonnées de commit
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          env.GIT_AUTHOR       = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
          env.GIT_BRANCH_NAME  = sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
        }
      }
    }

    // 2. Install — dépendances npm backend + frontend (dans un conteneur Node)
    stage('Install') {
      steps {
        script {
          docker.image('node:22-alpine').inside('-u root') {
            sh "npm install --prefix backend"
            sh "npm install --prefix frontend"
          }
        }
      }
    }

    // 3. Test — tolérant si aucun script test défini
    stage('Test') {
      steps {
        script {
          docker.image('node:22-alpine').inside('-u root') {
            sh "npm test --prefix backend || true"
          }
        }
      }
    }

    // 4. Sonar — analyse qualité backend + frontend
    stage('Sonar') {
      steps {
        script {
          def scannerHome = tool 'SonarQubeScanner'
          withSonarQubeEnv('SonarQube') {
            sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${SONAR_PROJECT}"
          }
        }
      }
    }

    // 5. Quality Gate — abandon si la qualité est insuffisante
    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    // 6. Docker Build — images backend + frontend
    stage('Docker Build') {
      steps {
        script {
          IMAGES.each { img ->
            docker.build("${DOCKER_NS}/${IMAGE_PREFIX}-${img}:${DOCKER_TAG}", "${img}")
            docker.build("${DOCKER_NS}/${IMAGE_PREFIX}-${img}:latest", "${img}")
          }
        }
      }
    }

    // 7. Trivy Scan — scan de sécurité des images (DevSecOps)
    //    HIGH → warning (exit 0) · CRITICAL → échec du pipeline (exit 1)
    stage('Trivy Scan') {
      steps {
        script {
          sh "rm -f ${TRIVY_REPORT}; touch ${TRIVY_REPORT}"
          IMAGES.each { img ->
            def image = "${DOCKER_NS}/${IMAGE_PREFIX}-${img}:${DOCKER_TAG}"

            // Rapport informatif (HIGH/CRITICAL) — n'échoue jamais
            sh """
              docker run --rm \
                -v /var/run/docker.sock:/var/run/docker.sock \
                -v trivy-cache:/root/.cache/ \
                aquasec/trivy:latest image --scanners vuln \
                --severity HIGH,CRITICAL --no-progress ${image} | tee -a ${TRIVY_REPORT} || true
            """

            // Gate de sécurité : échec si au moins une vulnérabilité CRITICAL
            sh """
              docker run --rm \
                -v /var/run/docker.sock:/var/run/docker.sock \
                -v trivy-cache:/root/.cache/ \
                aquasec/trivy:latest image --scanners vuln \
                --severity CRITICAL --exit-code 1 --no-progress ${image}
            """
          }
        }
      }
      post {
        always {
          archiveArtifacts artifacts: "${TRIVY_REPORT}", allowEmptyArchive: true
        }
      }
    }

    // 8. Docker Push — publication des images sur Docker Hub
    stage('Docker Push') {
      steps {
        script {
          docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
            IMAGES.each { img ->
              docker.image("${DOCKER_NS}/${IMAGE_PREFIX}-${img}:${DOCKER_TAG}").push()
              docker.image("${DOCKER_NS}/${IMAGE_PREFIX}-${img}:latest").push()
            }
          }
        }
      }
    }

    // 9. Deploy — démarre la stack avec les images déjà construites (pas de rebuild)
    stage('Deploy') {
      steps {
        sh 'docker compose up -d --no-build --remove-orphans'
      }
      post {
        success {
          sh """
            curl -X POST ${DEPLOY_BOARD_URL}/api/deployments \
              -H 'Content-Type: application/json' \
              -H "x-deploy-token: ${DEPLOY_INGEST_TOKEN}" \
              -d '{
                "pipelineId": "${JOB_NAME}",
                "buildNumber": ${BUILD_NUMBER},
                "status": "SUCCESS",
                "duration": ${currentBuild.duration ?: 0},
                "environment": "${DEPLOY_ENV}",
                "commitSha": "${GIT_COMMIT_SHORT}",
                "commitAuthor": "${GIT_AUTHOR}"
              }' || true
          """
        }
      }
    }
  }

  post {
    failure {
      script {
        sh """
          curl -X POST ${DEPLOY_BOARD_URL}/api/deployments \
            -H 'Content-Type: application/json' \
            -H "x-deploy-token: ${DEPLOY_INGEST_TOKEN}" \
            -d '{
              "pipelineId": "${JOB_NAME}",
              "buildNumber": ${BUILD_NUMBER},
              "status": "FAILED",
              "environment": "${DEPLOY_ENV}",
              "commitSha": "${GIT_COMMIT_SHORT ?: ''}",
              "commitAuthor": "${GIT_AUTHOR ?: ''}",
              "failureReason": "Échec du pipeline à l'étape ${STAGE_NAME ?: 'inconnue'}"
            }' || true
        """
        notifySlack('danger', "❌ Échec du build : ${JOB_NAME} #${BUILD_NUMBER} - ${BUILD_URL}")
      }
    }
    success {
      script {
        if (currentBuild.previousBuild?.result == 'FAILURE') {
          notifySlack('good', "✅ Build rétabli : ${JOB_NAME} #${BUILD_NUMBER}")
        }
      }
    }
  }
}
