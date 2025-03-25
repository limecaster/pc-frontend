import React from "react";
import { Modal, Button } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface DiscountConfirmationModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onKeepAutomatic: () => void;
    couponCode: string;
    autoAmount: number;
    discountAmount: number;
    formatCurrency: (amount: number) => string;
}

const DiscountConfirmationModal: React.FC<DiscountConfirmationModalProps> = ({
    show,
    onClose,
    onConfirm,
    onKeepAutomatic,
    couponCode,
    autoAmount,
    discountAmount,
    formatCurrency,
}) => {
    return (
        <Modal show={show} size="md" popup onClose={onClose}>
            <Modal.Header />
            <Modal.Body>
                <div className="text-center">
                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-amber-500" />
                    <h3 className="mb-5 text-lg font-normal text-gray-700">
                        Mã giảm giá tự động hiện tại giảm{" "}
                        {formatCurrency(autoAmount)}, trong khi mã "{couponCode}
                        " chỉ giảm {formatCurrency(discountAmount)}.
                    </h3>
                    <h4 className="mb-5 text-base font-medium text-gray-900">
                        Bạn có chắc chắn muốn áp dụng mã "{couponCode}" không?
                    </h4>
                    <div className="flex justify-center gap-4">
                        <Button color="blue" onClick={onKeepAutomatic}>
                            Giữ khuyến mãi tự động
                        </Button>
                        <Button color="warning" onClick={onConfirm}>
                            Xác nhận dùng mã giảm giá
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default DiscountConfirmationModal;
