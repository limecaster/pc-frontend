"use client";

import React, { useEffect } from "react";
import FaqPage from "@/components/faq/FaqPage";

const Faq = () => {
    useEffect(() => {
        document.title = "B Store - Câu hỏi thường gặp";
    }, []);
    return <FaqPage />;
};

export default Faq;
