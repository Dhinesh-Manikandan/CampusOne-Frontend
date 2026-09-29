pipeline {
    agent any

    environment {
        // Docker Hub repository name (Format: <dockerhub-username>/<repository-name>)
        DOCKER_IMAGE_NAME = "dhineshmanikandan2006/campusone-frontend"
        // Jenkins Credentials ID for Docker Hub username/password
        DOCKER_HUB_CREDENTIALS_ID = "docker-hub-credentials"
        // Build tag using the unique Jenkins build number
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code from Git repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing project dependencies using npm ci...'
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running automated tests if configured in package.json...'
                // --if-present ensures the stage completes successfully if no test script is defined
                sh 'npm test --if-present'
            }
        }

        stage('Build React Application') {
            steps {
                echo 'Validating production build with npm run build...'
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${DOCKER_IMAGE_NAME}:${IMAGE_TAG} and ${DOCKER_IMAGE_NAME}:latest..."
                sh """
                    docker build -t ${DOCKER_IMAGE_NAME}:${IMAGE_TAG} -t ${DOCKER_IMAGE_NAME}:latest .
                """
            }
        }

        stage('Login to Docker Hub') {
            steps {
                echo 'Logging in to Docker Hub using Jenkins managed credentials...'
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_HUB_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                echo "Pushing Docker image tags to Docker Hub..."
                sh """
                    docker push ${DOCKER_IMAGE_NAME}:${IMAGE_TAG}
                    docker push ${DOCKER_IMAGE_NAME}:latest
                """
            }
        }
    }

    post {
        always {
            echo 'Cleaning up local workspace and logging out of Docker...'
            sh 'docker logout || true'
        }
        success {
            echo "CI/CD Pipeline finished successfully! Docker image pushed as ${DOCKER_IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo 'CI/CD Pipeline failed! Check stage console output for debugging.'
        }
    }
}
