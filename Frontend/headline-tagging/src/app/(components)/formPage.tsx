"use client";

import React, { useState } from "react";
import styles from "../page.module.css";

const capitalizeWord = (word: string) => {
   return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

interface ResultType {
   class?: string;
   probability?: number;
   status: string;
}

const FormPage = ({
   toggleFeedbackModal,
}: {
   toggleFeedbackModal: Function;
}) => {
   const [textValue, setTextValue] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [result, setResult] = useState<ResultType>({ status: "INIT" });

   const getHeadlineTag = async () => {
      setIsLoading(true);
      const url = "http://127.0.0.1:5000/getHeadlineTag";
      const data = { headline: textValue };

      try {
         const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
         });

         const responseData = await response.json();
         setResult({ ...responseData, status: "SUCCESS" });
      } catch (error) {
         setResult({ status: "There was an error processing your request" });
         console.error("Error:", error);
      }
      setIsLoading(false);
   };

   const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextValue(event?.target?.value);
   };

   const getColor = () => {
      const probability = result?.probability || 0;
      return probability >= 0.6
         ? "alert-success"
         : probability >= 0.5
         ? "alert-warning"
         : "alert-danger";
   };

   return (
      <div className={styles.subContainer}>
         <div className={`form ${styles.formContainer}`}>
            <div className="form-group">
               <label className={styles.formLabel} htmlFor="textarea">
                  Enter headline
               </label>
               <textarea
                  className={`form-control ${styles.description}`}
                  id="textarea"
                  rows={3}
                  placeholder="Please type your headline here..."
                  value={textValue}
                  onChange={handleTextChange}
               />
            </div>
            {isLoading && (
               <div className="spinner-border text-secondary" role="status">
                  <span className="sr-only">Loading...</span>
               </div>
            )}
            {!isLoading && result?.status == "INIT" && (
               <button
                  type="button"
                  className={`btn btn-lg btn-primary ${styles.assignBtn}`}
                  onClick={getHeadlineTag}
               >
                  Assign tag
               </button>
            )}
            {!isLoading && result?.status != "INIT" && (
               <div className={styles.resultContainer}>
                  <div className={`alert ${getColor()}`} role="alert">
                     {result?.status == "SUCCESS" ? (
                        <strong>{`Headline tag: ${capitalizeWord(
                           result?.class || ""
                        )} | Probability: ${
                           (result?.probability || 0) * 100
                        }%`}</strong>
                     ) : (
                        result?.status
                     )}
                     <button
                        type="button"
                        className="close"
                        onClick={() => setResult({ status: "INIT" })}
                     >
                        <span aria-hidden="true">&times;</span>
                     </button>
                  </div>
                  <button
                     type="button"
                     className="btn btn-link btn-lg"
                     onClick={() => toggleFeedbackModal()}
                  >
                     Feedback
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

export default FormPage;
