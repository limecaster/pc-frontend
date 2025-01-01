"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/compat/router";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

const AutoBuildPC: React.FC = () => {
  const router = useRouter();
  let [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<{ category: string; items: any[]; savings: number; promo: number; }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router?.isReady) return;
  }, [router?.isReady]);

  const handleInputChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setInput(e.target.value);
  };

  const handleBuildClick = async () => {
    setLoading(true);
    try {
      if (!input) {
        input = "PC để chơi game R7 7800X3D, khoảng 25 triệu";
        setInput(input);
      }
      const response = await fetch("http://localhost:3001/build/auto-build", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: input }),
      });
      const data = await response.json();
      const formattedSuggestions = [
        {
          category: "Saving",
          items: Object.values(data?.saving) || [],
          savings: 20.0,
          promo: 30.0,
        },
        {
          category: "Performance",
          items: Object.values(data?.performance) || [],
          savings: 25.0,
          promo: 40.0,
        },
        {
          category: "Popular",
          items: Object.values(data?.popular) || [],
          savings: 15.0,
          promo: 25.0,
        },
      ];

      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomizeClick = (items: any[]) => {
    const selectedProducts = 
      {
        "CPU": items[0],
        "Quạt tản nhiệt": items[1],
        "Bo mạch chủ": items[2],
        "Card đồ họa": items[3],
        "RAM": items[4],
        "SSD": items[5],
        "Vỏ case": items[6],
        "Nguồn": items[7],
      }
    router?.push({
      pathname: '/manual-build-pc',
      query: { selectedProducts: JSON.stringify(selectedProducts) },
    });
  };

  const renderSuggestion = (category: string, items: any[]) => (
    <div className="item-cells-group border rounded shadow-md bg-neural-50">
      {category === "Saving" ? (
        <div className="grid grid-cols-1 place-items-center h-10 item-cells-top is-saving bg-gradient-to-b from-lime-100 to-bg-neural-50">
          <span className="bg-emerald-500 text-white text-xl font-medium me-2 px-2.5 py-1 rounded dark:bg-emerald-900 dark:text-emerald-300 -mt-10">
            Tiết kiệm
          </span>
        </div>
      ) : category === "Performance" ? (
        <div className="grid grid-cols-1 place-items-center h-10 item-cells-top is-performance bg-gradient-to-b from-orange-100 to-bg-neural-50">
          <span className="bg-orange-500 text-white text-xl font-medium me-2 px-2.5 py-1 rounded dark:bg-orange-900 dark:text-orange-300 -mt-10">
            Hiệu năng
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 place-items-center h-10 item-cells-top is-popular bg-gradient-to-b from-cyan-100 to-bg-neural-50">
          <span className="bg-cyan-500 text-white text-xl font-medium me-2 px-2.5 py-1 rounded dark:bg-cyan-900 dark:text-cyan-300 -mt-10">
            Phổ biến
          </span>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <div className="loader"></div>
        </div>
      ) : items.length !== 8 ? (
        <div className="text-center text-red-500 font-medium p-4">
          Không thể tạo cấu hình PC dựa trên yêu cầu của bạn.
        </div>
      ) : (
        items.map((item: { name: any; type: any; price: { toLocaleString: (arg0: string) => string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }; }, index: React.Key | null | undefined) => (
          <div key={index} className="grid grid-cols-7 gap-2 mb-2 px-4">
            <Image
              src={`https://via.placeholder.com/150`} // item.imageUrl
              width={150}
              height={150}
              alt={"Ảnh sản phẩm"}
              className="rounded "
            />
            <p className="col-span-3 text-zinc-900 leading-none font-medium">
              {item.name || item.type}
            </p>
            <p className="col-span-2 text-base font-semibold leading-none text-primary">
              {item.price?.toLocaleString("vi-VN")}đ
            </p>
            <div className="auto-build-actions">
              <FontAwesomeIcon icon={faRotate} className="text-zinc-900" />
            </div>
          </div>
        ))
      )}
      {items.length === 8 && (
        <div className="item-cell-action mt-4 p-4 text-right">
          <div className="item-combo-price">
            <p className="text-base font-semibold leading-none text-primary">
              Tổng tiền:{" "}
              {items
                .reduce((acc: any, item: { price: any; }) => acc + (item.price || 0), 0)
                .toLocaleString("vi-VN")}{" "}
              VND
            </p>
          </div>
          <div className="item-action">
            <button
              className="mt-2 bg-primary text-white font-medium py-1 px-4 rounded"
              onClick={() => handleCustomizeClick(items)}
              type="button"
            >
              Cá nhân hóa
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 bg-white shadow-md">
      <h1 className="text-4xl text-zinc-900 font-bold mb-4 text-center dark:text-zinc-100">
        XÂY DỰNG CẤU HÌNH PC THEO YÊU CẦU
      </h1>
      <p className="text-lg text-zinc-500 font-medium mb-4 text-center dark:text-zinc-100">
        Hãy mô tả nhu cầu của bạn để chúng tôi tư vấn cấu hình phù hợp nhất
      </p>
      <div className="text-sm text-zinc-700 font-medium mb-4 text-center dark:text-zinc-100">
        Sử dụng công nghệ AI để xây dựng cấu hình PC phù hợp với nhu cầu của bạn
        <span data-tooltip-target="tooltip-default">
          <FontAwesomeIcon icon={faCircleInfo} className="mx-1" />
          <div
            id="tooltip-default"
            role="tooltip"
            className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
          >
            Chức năng xây dựng cấu hình PC tự động đảm bảo các linh kiện trong cấu hình tương thích với nhau. Các linh kiện được chọn lựa dựa trên nhu cầu sử dụng và mức giá bạn mong muốn.
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </span>
      </div>
      <div className="flex gap-4 justify-center p-4 rounded">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="PC để chơi game R7 7800X3D, khoảng 25 triệu"
          className="border border-2 p-2 w-1/2 rounded mb-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={handleBuildClick}
          className="bg-primary text-white font-semibold py-2 px-4 h-11 rounded"
          type="button"
        >
          Xây dựng
        </button>
      </div>
      

      <div className="grid grid-cols-3 gap-4 mt-6">
        {suggestions.map((suggestion, index) => (
          <React.Fragment key={index}>
            {renderSuggestion(suggestion.category, suggestion.items)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AutoBuildPC;
