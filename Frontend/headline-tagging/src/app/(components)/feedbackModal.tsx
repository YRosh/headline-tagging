"use client";

import React, { useState } from "react";
import styles from "../page.module.css";

interface FormData {
   firstName?: string;
   lastName?: string;
   email?: string;
   feedback?: string;
}

const PastInteractionsModal = ({ closeModal }: { closeModal: Function }) => {
   const [formData, setFormData] = useState<FormData>({});
   const [formStatus, setFormStatus] = useState("SHOW");

   const saveFeedback = async () => {
      const url = "http://127.0.0.1:5000/saveFeedback";

      try {
         const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });
         setFormStatus("SUCCESS");
      } catch (error) {
         console.error(error);
         setFormStatus("ERROR");
      }
   };

   const updateFormData = (
      name: string,
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
   ) => {
      setFormData({ ...formData, [name]: event.target.value });
   };

   const getAlertClass = () =>
      formStatus == "ERROR" ? "alert-danger" : "alert-success";

   const getAlertMessage = () =>
      formStatus == "ERROR"
         ? "There was an error saving your feedback"
         : "Thank you for your feedback!";

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
                  <h5 className="modal-title">Feedback form</h5>
                  <button
                     type="button"
                     className="close"
                     onClick={() => closeModal()}
                  >
                     <span aria-hidden="true">&times;</span>
                  </button>
               </div>
               <div className={`modal-body ${styles.modalBody}`}>
                  <form>
                     <div className="row">
                        <div className="col">
                           <div className="form-group">
                              <label htmlFor="firstName">First name</label>
                              <input
                                 id="firstName"
                                 type="text"
                                 className="form-control"
                                 placeholder="Please enter your first name"
                                 value={formData?.firstName}
                                 onChange={(e) =>
                                    updateFormData("firstName", e)
                                 }
                              />
                           </div>
                        </div>
                        <div className="col">
                           <div className="form-group">
                              <label htmlFor="lastName">Last name</label>
                              <input
                                 id="lastName"
                                 type="text"
                                 className="form-control"
                                 placeholder="Please enter your last name"
                                 value={formData?.lastName}
                                 onChange={(e) => updateFormData("lastName", e)}
                              />
                           </div>
                        </div>
                     </div>
                     <div className="row">
                        <div className="col">
                           <div className="form-group">
                              <label htmlFor="formEmail">Email address</label>
                              <input
                                 type="email"
                                 className="form-control"
                                 id="formEmail"
                                 placeholder="Please enter your last name"
                                 value={formData?.email}
                                 onChange={(e) => updateFormData("email", e)}
                              />
                           </div>
                        </div>
                     </div>
                     <div className="row">
                        <div className="col">
                           <div className="form-group">
                              <label htmlFor="formFeedback">Feedback</label>
                              <textarea
                                 className="form-control"
                                 id="formFeedback"
                                 rows={5}
                                 value={formData?.feedback}
                                 onChange={(e) => updateFormData("feedback", e)}
                                 placeholder="Please type your message here..."
                              />
                           </div>
                        </div>
                     </div>
                     <div className="row">
                        <div className="col" style={{ textAlign: "end" }}>
                           <button
                              type="button"
                              className="btn btn-primary btn-lg"
                              style={{ alignItems: "flex-end" }}
                              onClick={saveFeedback}
                           >
                              Submit
                           </button>
                        </div>
                     </div>
                     {formStatus != "SHOW" && (
                        <div
                           className={`alert ${getAlertClass()}`}
                           role="alert"
                        >
                           {getAlertMessage()}
                        </div>
                     )}
                  </form>
               </div>
               <div className={styles.backdrop} />
            </div>
         </div>
      </div>
   );
};

export default PastInteractionsModal;
