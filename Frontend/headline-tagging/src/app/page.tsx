"use client";

import React, { useState } from "react";
import FormPage from "./(components)/formPage";
import styles from "./page.module.css";
import PastInteractionsModal from "./(components)/pastInteractionsModal";

const Home = () => {
   const [showForm, setShowForm] = useState(false);
   const [showPIModal, setShowPIModal] = useState(false);

   const onTryItClick = () => {
      if (!showForm) setShowForm(true);
   };

   const togglePIModal = () => setShowPIModal(!showPIModal);

   return (
      <div className={styles.container}>
         <div className={styles.subContainer}>
            <p className={styles.title}>Tag your headline</p>
            <p className={styles.description}>
               Have a news headline and want to tag it into some pre-determined
               news categories? Just enter your news headline, our AI model will
               predict the category this news headline belongs to
            </p>
            <div className={styles.btnContainer}>
               <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  style={{ width: "100px" }}
                  onClick={onTryItClick}
               >
                  Try it!
               </button>
               <button
                  type="button"
                  className="btn btn-link btn-lg"
                  onClick={togglePIModal}
               >
                  View past interactions
               </button>
            </div>
         </div>
         {showForm ? (
            <FormPage />
         ) : (
            <div className={styles.subContainer}>
               <p className={styles.appName}>Headline Tagger</p>
            </div>
         )}

         {showPIModal && <PastInteractionsModal closeModal={togglePIModal} />}
      </div>
   );
};

export default Home;
