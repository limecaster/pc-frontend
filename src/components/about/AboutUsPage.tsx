"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getTeamMembers, TeamMember } from "@/api/team-members";
import { getAboutPageImage, AboutImage } from "@/api/about-content";

// Fallback team member data in case CMS data is not available
const fallbackTeamMembers = [
    {
        id: 1,
        contentKey: "member-1",
        title: "Đỗ Văn Bâng",
        description: "Sinh viên thực hiện ĐATN",
        imageUrl: "/images/team/member1.jpg",
        displayOrder: 1,
    },
    {
        id: 2,
        contentKey: "member-2",
        title: "Trần Thị B",
        description: "CTO",
        imageUrl: "/images/team/member2.jpg",
        displayOrder: 2,
    },
    {
        id: 3,
        contentKey: "member-3",
        title: "Lê Văn C",
        description: "Lead Developer",
        imageUrl: "/images/team/member3.jpg",
        displayOrder: 3,
    },
    {
        id: 4,
        contentKey: "member-4",
        title: "Phạm Thị D",
        description: "Marketing Director",
        imageUrl: "/images/team/member4.jpg",
        displayOrder: 4,
    },
];

// Features list - updated to match footer content
const features = [
    "Trang web thương mại điện tử",
    "Chuyên bán linh kiện máy tính và PC",
    "Hỗ trợ tính năng build-PC",
    "Có hệ thống gợi ý",
    "Tư vấn chuyên sâu bởi đội ngũ kỹ thuật có kinh nghiệm",
    "Dịch vụ hỗ trợ khách hàng 24/7",
    "Bảo hành chính hãng cho tất cả sản phẩm",
    "Giao hàng nhanh chóng toàn quốc",
];

// Default about page image to use as fallback
const DEFAULT_ABOUT_IMAGE = "/images/about-us.jpg";

const AboutUsPage = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [aboutImage, setAboutImage] = useState<string>(DEFAULT_ABOUT_IMAGE);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch both team members and about image in parallel
                const [teamData, imageData] = await Promise.all([
                    getTeamMembers(),
                    getAboutPageImage(),
                ]);

                // Handle team members data
                if (teamData.length > 0) {
                    setTeamMembers(teamData);
                } else {
                    setTeamMembers(fallbackTeamMembers);
                }

                // Handle about image data
                if (imageData && imageData.imageUrl) {
                    setAboutImage(imageData.imageUrl);
                }
            } catch (error) {
                console.error("Error fetching about page data:", error);
                setTeamMembers(fallbackTeamMembers);
                // About image will use the default value
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* First row - Two columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Column 1: Company information */}
                    <div className="flex flex-col justify-center">
                        <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium inline-block mb-4 w-fit">
                            Chúng tôi là ai
                        </span>
                        <h1 className="text-4xl font-bold text-gray-800 mb-6">
                            B Store - Đồ Án Tốt Nghiệp
                        </h1>
                        <p className="text-gray-600 mb-6 text-lg">
                            B Store là đồ án tốt nghiệp hướng hệ thống thông tin
                            được thực hiện bởi Đỗ Văn Bâng. Đây là một trang web
                            thương mại điện tử, chuyên bán linh kiện máy tính và
                            PC, với tính năng hỗ trợ build-PC. Chúng tôi cung
                            cấp các sản phẩm công nghệ chất lượng cao, dịch vụ
                            tư vấn chuyên nghiệp và giải pháp toàn diện cho nhu
                            cầu máy tính của bạn.
                        </p>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Thông tin liên hệ:
                            </h3>
                            <p className="flex items-center text-gray-600 mb-2">
                                <svg
                                    className="h-5 w-5 text-primary mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                </svg>
                                1900 123 456
                            </p>
                            <p className="flex items-center text-gray-600 mb-2">
                                <svg
                                    className="h-5 w-5 text-primary mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                Thủ Đức, TP. Hồ Chí Minh
                            </p>
                            <p className="flex items-center text-gray-600">
                                <svg
                                    className="h-5 w-5 text-primary mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <a
                                    href="mailto:bang.do38@hcmut.edu.vn"
                                    className="hover:text-primary"
                                >
                                    bang.do38@hcmut.edu.vn
                                </a>
                            </p>
                        </div>

                        <div className="mt-2">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Điểm nổi bật của chúng tôi:
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {features.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start"
                                    >
                                        <svg
                                            className="h-6 w-6 text-primary mt-0.5 mr-2 flex-shrink-0"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span className="text-gray-600">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Column 2: Image - Now using dynamic image from CMS */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
                            {loading ? (
                                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                            ) : (
                                <Image
                                    src={aboutImage}
                                    alt="About B Store"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 600px"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-200 my-12"></div>

                {/* Row 2: Project Information */}
                <div className="mb-12 bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                        Về Đồ Án Tốt Nghiệp
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <p className="text-gray-600 mb-4">
                                B Store là đồ án tốt nghiệp theo hướng hệ thống
                                thông tin, được thực hiện bởi sinh viên Đỗ Văn
                                Bâng. Dự án này là một nỗ lực nhằm tạo ra một
                                nền tảng thương mại điện tử đầy đủ chức năng,
                                tập trung vào lĩnh vực linh kiện máy tính và PC.
                            </p>
                            <p className="text-gray-600 mb-4">
                                Mục tiêu của dự án là xây dựng một hệ thống toàn
                                diện với các tính năng tiên tiến như tư vấn
                                build PC và hệ thống gợi ý sản phẩm dựa trên nhu
                                cầu của người dùng, mang lại trải nghiệm mua sắm
                                trực tuyến tiện lợi và thông minh.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Công nghệ sử dụng:
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-start">
                                    <svg
                                        className="h-6 w-6 text-primary mt-0.5 mr-2 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="text-gray-600">
                                        Frontend: Next.js, React, TailwindCSS
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="h-6 w-6 text-primary mt-0.5 mr-2 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="text-gray-600">
                                        Backend: Nest.js
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="h-6 w-6 text-primary mt-0.5 mr-2 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="text-gray-600">
                                        Database: Postgres, Neo4j
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="h-6 w-6 text-primary mt-0.5 mr-2 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="text-gray-600">
                                        Tools: Docker, Kafka
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="h-6 w-6 text-primary mt-0.5 mr-2 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="text-gray-600">
                                        AI/ML: Hệ thống gợi ý và tư vấn sản phẩm
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Row 3: Team members */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Đội ngũ thực hiện
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Những con người tài năng và đam mê đứng sau thành công
                        của B Store
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading
                        ? // Loading state
                          Array(4)
                              .fill(0)
                              .map((_, index) => (
                                  <div
                                      key={index}
                                      className="bg-white rounded-lg shadow-md overflow-hidden"
                                  >
                                      <div className="h-64 bg-gray-200 animate-pulse"></div>
                                      <div className="p-5">
                                          <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                                          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                      </div>
                                  </div>
                              ))
                        : // Display team members
                          teamMembers.map((member) => (
                              <div
                                  key={member.id}
                                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                              >
                                  <div className="relative h-64">
                                      <Image
                                          src={member.imageUrl}
                                          alt={member.title}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                                      />
                                  </div>
                                  <div className="p-5 text-center">
                                      <h3 className="font-bold text-lg text-gray-800">
                                          {member.title}
                                      </h3>
                                      <p className="text-gray-600">
                                          {member.description}
                                      </p>
                                  </div>
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
