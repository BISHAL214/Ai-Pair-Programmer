"use client";

import { useParams } from "next/navigation";
import React from "react";

const UserProjectPage = () => {
  const params = useParams();

  return <div>{params.projectId}</div>;
};

export default UserProjectPage;
