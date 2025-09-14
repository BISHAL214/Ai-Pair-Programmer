"use client";

import { useParams } from "next/navigation";
import React from "react";

type Props = {};

const UserProjectPage = (props: Props) => {
  const params = useParams();

  return <div>{params.projectId}</div>;
};

export default UserProjectPage;
