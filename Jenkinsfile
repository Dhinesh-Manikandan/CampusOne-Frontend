pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = "dhineshmanikandan2006/campusone-frontend"
        DOCKER_HUB_CREDENTIALS_ID = "docker-hub-credentials"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo '=== Stage 1: Checkout Source Code ==='
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '=== Stage 2: Install Dependencies ==='

                script {
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo '=== Stage 3: Run Tests ==='

                script {
                    if (isUnix()) {
                        sh 'npm test --if-present'
                    } else {
                        bat 'npm test --if-present'
                    }
                }
            }
        }

        stage('Build React Application') {
            steps {
                echo '=== Stage 4: Build React Application ==='

                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }

    stage('Check Docker') {
    steps {
        bat 'docker --version'
        bat 'docker info'
        }
    }
        
        stage('Build Docker Image') {
            steps {
                echo '=== Stage 5: Build Docker Image ==='

                script {
                    if (isUnix()) {
                        sh """
                            docker build \
                              --build-arg VITE_API_BASE_URL=/api \
                              -t ${DOCKER_IMAGE_NAME}:${IMAGE_TAG} \
                              -t ${DOCKER_IMAGE_NAME}:latest .
                        """
                    } else {
                        bat """
                            docker build ^
                              --build-arg VITE_API_BASE_URL=/api ^
                              -t %DOCKER_IMAGE_NAME%:%IMAGE_TAG% ^
                              -t %DOCKER_IMAGE_NAME%:latest .
                        """
                    }
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                echo '=== Stage 6: Login to Docker Hub ==='

                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_HUB_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    script {
                        if (isUnix()) {
                            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        } else {
                            bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
                        }
                    }
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                echo '=== Stage 7: Push Docker Image ==='

                script {
                    if (isUnix()) {
                        sh """
                            docker push ${DOCKER_IMAGE_NAME}:${IMAGE_TAG}
                            docker push ${DOCKER_IMAGE_NAME}:latest
                        """
                    } else {
                        bat """
                            docker push %DOCKER_IMAGE_NAME%:%IMAGE_TAG%
                            docker push %DOCKER_IMAGE_NAME%:latest
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo '=== Pipeline Completed ==='

            script {
                if (isUnix()) {
                    sh 'docker logout || true'
                } else {
                    bat 'docker logout || exit 0'
                }
            }
        }

        success {
            echo "SUCCESS: Frontend Docker image pushed successfully."
            echo "Image: ${DOCKER_IMAGE_NAME}:${IMAGE_TAG}"
            echo "Image: ${DOCKER_IMAGE_NAME}:latest"
        }

        failure {
            echo 'FAILURE: Frontend pipeline failed. Check the console output.'
        }
    }
}
