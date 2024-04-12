"use client";

import React, { useState } from "react";
import styles from "../page.module.css";
import Loader from "./Loader";
import { BACKEND_URL } from "../layout";

// interface to store the feedback form data
interface FormData {
   firstName?: string;
   lastName?: string;
   email?: string;
   feedback?: string;
   error?: boolean;
}

// component which shows the feedback form in a modal
const PastInteractionsModal = ({ closeModal }: { closeModal: Function }) => {
   const [formData, setFormData] = useState<FormData>({});
   const [formStatus, setFormStatus] = useState("SHOW");
   const [isLoading, setIsLoading] = useState(false);

   // basic form validation for email and empty value check
   const formValidate = () => {
      if (formData?.feedback?.length == 0 || formData?.email?.length == 0) {
         setFormData({ ...formData, error: true });
         return false;
      }
      const regex =
         // Regex got from Chat GPT
         /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const isValid = regex.test(String(formData?.email).toLowerCase());
      setFormData({ ...formData, error: !isValid });
      return isValid;
   };

   // function to call the API and save the user feedback in the database
   const saveFeedback = async () => {
      const isValid = formValidate();
      if (!isValid) return;

      const url = `${BACKEND_URL}/saveFeedback`;
      setIsLoading(true);
      try {
         await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });
         setFormStatus("SUCCESS");
         setFormData({ error: false });
      } catch (error) {
         console.error(error);
         setFormStatus("ERROR");
      }
      setIsLoading(false);
   };

   // function to update the state of the form with the user entered details
   const updateFormData = (
      name: string,
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
   ) => {
      setFormData({ ...formData, [name]: event.target.value });
   };

   // function to get the color of the alert box after data submission. Red for error and green fo success
   const getAlertClass = () =>
      formStatus == "ERROR" ? "alert-danger" : "alert-success";

   // function to get the message to show in the alert box after submission
   const getAlertMessage = () =>
      formStatus == "ERROR"
         ? "There was an error saving your feedback"
         : "Thank you for your feedback!";

   // function to assign the valid/invalid states classes for form fields
   const getFormControlClassNames = () =>
      formData?.error === true ? "form-control is-invalid" : "form-control";

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
                     className="btn-close"
                     onClick={() => closeModal()}
                  />
               </div>
               <div className={`modal-body ${styles.modalBody}`}>
                  <form>
                     <div className="row g-4">
                        <div className="col-6">
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
                        <div className="col-6">
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
                        <div className="col-12">
                           <div className="form-group">
                              <label htmlFor="formEmail">Email address*</label>
                              <input
                                 type="email"
                                 className={getFormControlClassNames()}
                                 id="formEmail"
                                 placeholder="Please enter your last name"
                                 value={formData?.email}
                                 onChange={(e) => updateFormData("email", e)}
                                 required
                              />
                           </div>
                        </div>
                        <div className="col-12">
                           <div className="form-group">
                              <label htmlFor="formFeedback">Feedback*</label>
                              <textarea
                                 className={getFormControlClassNames()}
                                 id="formFeedback"
                                 rows={5}
                                 value={formData?.feedback}
                                 onChange={(e) => updateFormData("feedback", e)}
                                 placeholder="Please type your message here..."
                                 required
                              />
                           </div>
                        </div>
                        <div className="col-12" style={{ textAlign: "end" }}>
                           {isLoading ? (
                              <Loader />
                           ) : (
                              <button
                                 type="button"
                                 className="btn btn-primary btn-lg"
                                 style={{ alignItems: "flex-end" }}
                                 onClick={saveFeedback}
                              >
                                 Submit
                              </button>
                           )}
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
