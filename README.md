# Headline Tagging

This is a simple web application to assign tags to news headlines. For simplicity purpose only 5 categories of news are chosen, which are
`'POLITICS', 'WELLNESS', 'ENTERTAINMENT', 'TRAVEL', 'STYLE & BEAUTY'`. The user has to enter the news headline they want to categorize, and when they click the **'Assign Tag'** button, the AI model in the backend predicts the appropriate tag for the headline and sends it back to the user along with the confidence level of the model, that the assigned category is correct. The users can also check all the past interactions they made by clicking on the **'View past interactions'** button. Finally, the users can also send a feedback by clicking on the **'Feedback'** button, which saves the feedback in the database along with some basic user details.

### AI model information

I have trained the AI model myself. I have used **Python** with **Scikit-learn** and **sentence-transformers**. I have performed the training on google colab. The dataset I have used can be found [here](https://www.kaggle.com/datasets/rmisra/news-category-dataset). I have used the sentence transformer with BERT to convert the sentences to word-embeddings and have further trained a RandomForest model with these embeddings as input and the respective category as output. Finally the trained model is saved to a pickle file and this pickle file is loaded in the backend APIs to get the prediction. The `News_Headline_Tagging.ipynb` has the code used for the AI model training and can be checkout.

### Setup instructions

The setup involves 3 stages which are the setup of the database, then the backend code and finally the frontend code.

#### Database

-  I have used **MySQL** as the database server for this application. Assuming MySQL is already installed on your system, we can proceed to the next steps.
-  You can either use an existing database on your server or create a new one. Then you have to add this information in the backend code. In the `Backend/app.py` file you can find the `db_config` in the first few lines.
-  Once you add this information the backend code can handle the rest of the setup by creating the necessary tables required for the application.
-  Keep this database server running for the application.

#### Backend

-  Moving on to the Backend code setup, I have used **Python** (version 3.9.12) with **Flask** for the backend of this application.
-  You can either create a new virtual environment or use an existing one. You can find the `requirements.txt` file in the `Backend` folder for the required packages. Simply run

```
pip install -r requirements.txt
```

-  The saved AI model can be accessed from [here](https://drive.google.com/file/d/1is4owGy0N84NyLXBN3JNXV026Gr-rH7e/view?usp=sharing) as a pickle file. Place this file in the `Backend` folder, along with the `app.py` file.
-  Once the required packages are installed and saved AI model is added, you can run the below command to start the backend server.

```
python app.py
```

#### Frontend

-  Now we can start the setup of the frontend code. I have used **Node.js** (version 20.12.2), **Next.js** and **Typescript** for the frontend. Ensure the your npm is version 9.2.0 and if using nvm it is of version 0.39.7.
-  In the `Frontend/headline-tagging/src/app/layout.tsx` file you will find the `BACKEND_URL`. If necessary please change this to whatever the Flask server shows when it is run.
-  Now you can simply go to the `Frontend/headline-tagging` folder and run the below command to install the necessary packages.

```
npm i
```

-  Once the packages are done, run the below command to start the frontend server. Navigate to the URL displayed from the browser to use the app.

```
npm run dev
```
