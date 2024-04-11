"use client";

import React, { useState, useEffect } from "react";
import styles from "../page.module.css";

const PastInteractionsModal = ({ closeModal }: { closeModal: Function }) => {
   const [isLoading, setIsLoading] = useState(false);
   const [data, setData] = useState([]);

   const fetchInteractions = async () => {
      setIsLoading(true);

      const url = "http://127.0.0.1:5000/getUserInteractions";

      try {
         const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
         });

         const responseData = await response.json();
         setData(responseData);
      } catch (error) {
         console.error("Error:", error);
      }
      setIsLoading(false);
   };

   useEffect(() => {
      fetchInteractions();
   }, []);

   return (
      <div
         className="modal show"
         tabIndex={-1}
         role="dialog"
         style={{ display: "block" }}
      >
         <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
               <div className="modal-header">
                  <h5 className="modal-title">Past user interactions</h5>
                  <button
                     type="button"
                     className="close"
                     onClick={() => closeModal()}
                  >
                     <span aria-hidden="true">&times;</span>
                  </button>
               </div>
               <div className={`modal-body ${styles.modalBody}`}>
                  {isLoading && (
                     <div
                        className="spinner-border text-secondary"
                        role="status"
                     >
                        <span className="sr-only">Loading...</span>
                     </div>
                  )}
                  {!isLoading && data.length == 0 && (
                     <div className="alert alert-light" role="alert">
                        No interactions made so far
                     </div>
                  )}
                  {!isLoading && data.length != 0 && (
                     <table className="table table-hover">
                        <thead className="thead-dark">
                           <tr>
                              <th scope="col">#</th>
                              <th scope="col">Headline</th>
                              <th scope="col" style={{ width: "25%" }}>
                                 Model response
                              </th>
                              <th scope="col">Probabilities</th>
                           </tr>
                        </thead>
                        <tbody>
                           {data.map(
                              ({
                                 id,
                                 user_input,
                                 model_response,
                                 probabilities,
                              }) => (
                                 <tr>
                                    <th scope="row">{id}</th>
                                    <td>{user_input}</td>
                                    <td>{model_response}</td>
                                    <td>{probabilities}</td>
                                 </tr>
                              )
                           )}
                        </tbody>
                     </table>
                  )}
               </div>
               <div className={styles.backdrop} />
            </div>
         </div>
      </div>
   );
};

export default PastInteractionsModal;
