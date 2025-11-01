pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'worlddev162'
        IMAGE_NAME = 'react-app-chatbot'
        K8S_GIT_REPO = 'https://github.com/gajanan43/react_app_Docker_K8S.git'
        K8S_DEPLOYMENT_PATH = 'argocd/k8s/deployment.yml'
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-login')
        GIT_USER = 'gajanan43'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo "📦 Cloning repository..."
                git url: "${K8S_GIT_REPO}", branch: 'main'
            }
        }

        stage('Bump Version') {
            steps {
                echo "🔢 Bumping version number..."
                script {
                    def versionFile = readFile('version.txt').trim()
                    def (major, minor, patch) = versionFile.replace('v','').tokenize('.').collect { it.toInteger() }
                    patch += 1
                    def newVersion = "v${major}.${minor}.${patch}"
                    env.IMAGE_TAG = newVersion
                    writeFile file: 'version.txt', text: newVersion
                    echo "✅ New version: ${newVersion}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🏗️ Building Docker image..."
                sh '''
                    docker build -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo "📤 Pushing image to Docker Hub..."
                sh '''
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                    docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}
                    docker logout
                '''
            }
        }

        stage('Update Kubernetes Deployment') {
            steps {
                echo "📝 Updating Kubernetes deployment manifest..."
                withCredentials([string(credentialsId: 'github-credentials', variable: 'GIT_TOKEN')]) {
                    sh '''
                        git config user.email "narwadearjun9143@gmail.com"
                        git config user.name "Jenkins CI"

                        # Update image version inside deployment manifest
                        sed -i "s|image: .*|image: ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}|" ${K8S_DEPLOYMENT_PATH}

                        # Add updated files
                        git add ${K8S_DEPLOYMENT_PATH} version.txt
                        git commit -m "Update image tag to ${IMAGE_TAG}" || echo "No changes to commit"

                        # Push to GitHub
                        git push https://${GIT_USER}:${GIT_TOKEN}@github.com/gajanan43/react_app_Docker_K8S.git HEAD:main
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI pipeline completed successfully! Version: ${IMAGE_TAG}"
        }
        failure {
            echo "❌ CI pipeline failed. Please check logs."
        }
    }
}
