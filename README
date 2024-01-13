# Run locally

After cloning this repo, you'll need to do a few steps before you can
successfuly run it:
* Install dependencies with `npm install`
* Build the Strapi admin panel with `npm run build`
* Create the `./public/uploads` folder, as it is not tracked by Git.
* Create environment variables
  * See `env.example` for the required keys
* Start Strapi with `npm run develop`
* Create an admin account in the Strapi admin panel (`localhost:1337/strapi`)
* Add sample episodes to the database
  * Create an api token in Settings > API Tokens, give it full access rights
  * Add the token to `.env` as LOCAL_DEV_TOKEN
  * In a new terminal, upload basic episode data: `node ./scripts/upload-episodes.js`
  * If so inclined, add ~6GB of audio and images:
    * WARNING: these scripts will generate a lot of network activity as they
      fetch resources from Squarespace. Files will be added to
      `./public/uploads` if a different file service is not set up.
    * `node ./scripts/upload-audio.js`
    * ~~`node ./scripts/upload-image-attachments.js`~~ The server is currently
      not handling image uploads, don't run.