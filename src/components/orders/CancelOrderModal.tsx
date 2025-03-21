import React, { useState } from "react";
import { Modal, Button, Spinner } from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";

interface CancelOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    orderNumber: string;
    isLoading: boolean;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    orderNumber,
    isLoading,
}) => {
    const [reason, setReason] = useState<string>("");

    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Modal show={isOpen} onClose={onClose} size="md" popup>
            <Modal.Header />
            <Modal.Body>
                <div className="text-center">
                    <HiExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500">
                        Bạn có chắc chắn muốn hủy đơn hàng{" "}
                        <span className="font-medium">{orderNumber}</span>?
                    </h3>
                    <div className="mb-5">
                        <label
                            htmlFor="cancel-reason"
                            className="block mb-2 text-sm font-medium text-gray-900 text-left"
                        >
                            Lý do hủy đơn (tùy chọn):
                        </label>
                        <textarea
                            id="cancel-reason"
                            rows={3}
                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
                            placeholder="Nhập lý do hủy đơn hàng..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button
                            color="gray"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Không, giữ lại
                        </Button>
                        <Button
                            color="failure"
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Đang hủy...
                                </>
                            ) : (
                                "Có, hủy đơn hàng"
                            )}
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default CancelOrderModal;
