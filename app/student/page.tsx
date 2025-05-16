"use client";

import React from "react";

const StudentDashboard = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-900 px-4 py-12 text-light-100">
      <h1 className="text-4xl font-bold mb-4 text-brand text-center">
      Bienvenue sur PigierTP, cher étudiant !
      </h1>
      <p className="text-lg mb-8 text-center">
      Vous pouvez importé vos fichiers ici en toute sécurité. Cliquez sur le bouton ci-dessus pour commencer.
      </p>
    </div>
  );
};

export default StudentDashboard;
