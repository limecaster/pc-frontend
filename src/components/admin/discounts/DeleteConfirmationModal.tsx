import React from "react";
import { Modal, Button } from "flowbite-react";
import { DeleteConfirmationModalProps } from "@/types/discount";

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    deleteConfirmationId,
    setDeleteConfirmationId,
    handleDeleteDiscount,
    isSubmitting,
}) => {
    return (
        <Modal
            show={deleteConfirmationId !== null}
            onClose={() => setDeleteConfirmationId(null)}
            size="md"
        >
            <Modal.Header>Xác nhận xóa</Modal.Header>
            <Modal.Body>
                <div className="text-center">
                    <h3 className="mb-4 text-lg text-gray-500">
                        Bạn có chắc chắn muốn xóa mã giảm giá này?
                    </h3>
                    <p className="text-gray-600">
                        Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn mã
                        giảm giá khỏi hệ thống.
                    </p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={() => setDeleteConfirmationId(null)}
                    color="gray"
                >
                    Hủy
                </Button>
                <Button
                    color="failure"
                    onClick={handleDeleteDiscount}
                    isProcessing={isSubmitting}
                    disabled={isSubmitting}
                >
                    Xóa
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteConfirmationModal;
