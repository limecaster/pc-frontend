"use client";

import React, { useEffect } from "react";
import AboutUsPage from "@/components/about-us/AboutUsPage";

const About = () => {
    useEffect(() => {
        document.title = "B Store - Về chúng tôi";
    }, []);
    return <AboutUsPage />;
};

export default About;
