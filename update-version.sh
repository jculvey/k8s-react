if [ $# -eq 0 ]; then
    echo "Must provide a new version"
    exit 1
fi

OLD_VERSION=$(cat ./version)
NEW_VERSION=$1

sed -i '' "s/$OLD_VERSION/$NEW_VERSION/g" ./k8s/api-deployment.yaml
sed -i '' "s/$OLD_VERSION/$NEW_VERSION/g" ./k8s/frontend-deployment.yaml
sed -i '' "s/$OLD_VERSION/$NEW_VERSION/g" ./k8s/worker-deployment.yaml
sed -i '' "s/$OLD_VERSION/$NEW_VERSION/g" ./version
