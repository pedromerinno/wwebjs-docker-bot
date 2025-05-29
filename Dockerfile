FROM node:18

# Instala dependências do Chromium
RUN apt-get update && apt-get install -y     wget     ca-certificates     fonts-liberation     libappindicator3-1     libasound2     libatk-bridge2.0-0     libc6     libcairo2     libcups2     libdbus-1-3     libexpat1     libfontconfig1     libgbm1     libgcc1     libglib2.0-0     libgtk-3-0     libnspr4     libnss3     libx11-6     libx11-xcb1     libxcb1     libxcomposite1     libxdamage1     libxext6     libxfixes3     libxrandr2     xdg-utils     --no-install-recommends &&     apt-get clean &&     rm -rf /var/lib/apt/lists/*

# Cria a pasta da aplicação
WORKDIR /app

# Copia arquivos
COPY . .

# Instala dependências Node.js
RUN npm install

# Inicia a aplicação
CMD ["npm", "start"]