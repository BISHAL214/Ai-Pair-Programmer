/**
 * @file This file defines the page for a specific user project workspace.
 * It uses Next.js dynamic routing to capture the project ID from the URL
 * and displays it on the page.
 * @requires next/navigation
 * @requires react
 */
"use client";

import { useParams } from "next/navigation";
import React from "react";

/**
 * The page component for a user's project workspace.
 * It retrieves the project ID from the URL parameters using the `useParams` hook
 * and renders it. This page serves as the main view for a specific project.
 * @returns {JSX.Element} A div containing the project ID.
 */
const UserProjectPage = () => {
  const params = useParams();

  return <div>{params.projectId}</div>;
};

export default UserProjectPage;
