import React from "react";

interface SaveConfigurationModalProps {
    showModal: boolean;
    configName: string;
    configPurpose: string;
    onNameChange: (name: string) => void;
    onPurposeChange: (purpose: string) => void;
    onSave: () => void;
    onClose: () => void;
}

const SaveConfigurationModal: React.FC<SaveConfigurationModalProps> = ({
    showModal,
    configName,
    configPurpose,
    onNameChange,
    onPurposeChange,
    onSave,
    onClose,
}) => {
    return (
        <div
            id="save-config-modal"
            tabIndex={-1}
            inert={!showModal ? true : undefined}
            className={`${
                showModal ? "flex" : "hidden"
            } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-full bg-gray-900 bg-opacity-50`}
        >
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Lưu cấu hình PC
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                            onClick={onClose}
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label
                                htmlFor="configName"
                                className="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Tên cấu hình
                            </label>
                            <input
                                type="text"
                                id="configName"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                placeholder="Cấu hình PC gaming"
                                value={configName}
                                onChange={(e) => onNameChange(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="configPurpose"
                                className="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Mục đích sử dụng
                            </label>
                            <textarea
                                id="configPurpose"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                placeholder="Chơi game, làm đồ họa, văn phòng..."
                                value={configPurpose}
                                onChange={(e) =>
                                    onPurposeChange(e.target.value)
                                }
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end p-6 space-x-2 border-t border-gray-200">
                        <button
                            type="button"
                            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5"
                            onClick={onClose}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            className="text-white bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                            onClick={onSave}
                        >
                            Lưu cấu hình
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaveConfigurationModal;
