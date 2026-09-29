pipeline {
    agent any

    environment {
        // Docker configuration
        DOCKER_EXE = 'C:\\Users\\Dell\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
        DOCKER_HUB_USER = 'dhineshmanikandan2006'
        DOCKER_IMAGE_NAME = 'dhineshmanikandan2006/campusone-frontend'
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'

        // Image tag = Jenkins build number
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        // =========================================================
        // 1. CHECKOUT
        // =========================================================
        stage('Checkout Code') {
            steps {
                echo '=============================================='
                echo 'Stage 1: Checkout Source Code'
                echo '=============================================='

                checkout scm

                echo 'Source code checkout completed successfully.'
            }
        }

        // =========================================================
        // 2. INSTALL DEPENDENCIES
        // =========================================================
        stage('Install Dependencies') {
            steps {
                echo '=============================================='
                echo 'Stage 2: Install Dependencies'
                echo '=============================================='

                bat 'npm ci'

                echo 'Dependencies installed successfully.'
            }
        }

        // =========================================================
        // 3. RUN TESTS
        // =========================================================
        stage('Run Tests') {
            steps {
                echo '=============================================='
                echo 'Stage 3: Run Tests'
                echo '=============================================='

                bat 'npm test --if-present'

                echo 'Tests completed successfully.'
            }
        }

        // =========================================================
        // 4. BUILD REACT APPLICATION
        // =========================================================
        stage('Build React Application') {
            steps {
                echo '=============================================='
                echo 'Stage 4: Build React Application'
                echo '=============================================='

                // For Docker production deployment,
                // API requests use /api and are handled by Nginx.
                bat 'set VITE_API_BASE_URL=/api&& npm run build'

                echo 'React application built successfully.'
            }
        }

        // =========================================================
        // 5. VERIFY DOCKER
        // =========================================================
        stage('Verify Docker') {
            steps {
                echo '=============================================='
                echo 'Stage 5: Verify Docker'
                echo '=============================================='

                bat '"%DOCKER_EXE%" --version'

                echo 'Docker is accessible from Jenkins.'
            }
        }

        // =========================================================
        // 6. BUILD DOCKER IMAGE
        // =========================================================
        stage('Build Docker Image') {
            steps {
                echo '=============================================='
                echo 'Stage 6: Build Docker Image'
                echo '=============================================='

                bat """
                    "%DOCKER_EXE%" build ^
                      --build-arg VITE_API_BASE_URL=/api ^
                      -t %DOCKER_IMAGE_NAME%:%IMAGE_TAG% ^
                      -t %DOCKER_IMAGE_NAME%:latest .
                """

                echo "Docker image built successfully."
                echo "Image: %DOCKER_IMAGE_NAME%:%IMAGE_TAG%"
                echo "Image: %DOCKER_IMAGE_NAME%:latest"
            }
        }

        // =========================================================
        // 7. LOGIN TO DOCKER HUB
        // =========================================================
        stage('Docker Hub Login') {
            steps {
                echo '=============================================='
                echo 'Stage 7: Login to Docker Hub'
                echo '=============================================='

                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    bat '''
                        echo %DOCKER_PASS% | "%DOCKER_EXE%" login -u %DOCKER_USER% --password-stdin
                    '''
                }

                echo 'Docker Hub login successful.'
            }
        }

        // =========================================================
        // 8. PUSH DOCKER IMAGE
        // =========================================================
        stage('Push Docker Image') {
            steps {
                echo '=============================================='
                echo 'Stage 8: Push Docker Image to Docker Hub'
                echo '=============================================='

                bat """
                    "%DOCKER_EXE%" push %DOCKER_IMAGE_NAME%:%IMAGE_TAG%
                    "%DOCKER_EXE%" push %DOCKER_IMAGE_NAME%:latest
                """

                echo 'Docker images pushed successfully.'
                echo "Pushed: %DOCKER_IMAGE_NAME%:%IMAGE_TAG%"
                echo "Pushed: %DOCKER_IMAGE_NAME%:latest"
            }
        }

        // =========================================================
        // 9. VERIFY IMAGE
        // =========================================================
        stage('Verify Docker Image') {
            steps {
                echo '=============================================='
                echo 'Stage 9: Verify Docker Image'
                echo '=============================================='

                bat '"%DOCKER_EXE%" images %DOCKER_IMAGE_NAME%'

                echo 'Docker image verification completed.'
            }
        }
    }

    // =============================================================
    // POST BUILD ACTIONS
    // =============================================================
    post {

        success {
            echo '''
            ==============================================
            CAMPUSONE FRONTEND PIPELINE SUCCESS
            ==============================================
            Build completed successfully.

            Docker image:
            dhineshmanikandan2006/campusone-frontend

            Tags:
            - Jenkins Build Number
            - latest

            The image has been pushed to Docker Hub.
            ==============================================
            '''
        }

        failure {
            echo '''
            ==============================================
            CAMPUSONE FRONTEND PIPELINE FAILED
            ==============================================
            Please check the Jenkins console output
            for the failed stage.
            ==============================================
            '''
        }

        always {
            echo 'Pipeline execution completed.'

            // Logout from Docker Hub
            bat '"%DOCKER_EXE%" logout || exit 0'
        }
    }
}
