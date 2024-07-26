Set-Location central-pet-back

npm install

npm run build

docker build . -t central-pet-back:0.1.0

Set-Location ../central-pet-front

npm install

npm run build

docker build . -t central-pet-front:0.1.0

Set-Location ..

docker compose up -d