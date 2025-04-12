import React from 'react';
import { useModalStore } from '@/lib/stores/modal_store';
import AchievementModal from './AchievementModal/index';
import ConfirmationModal from './ConfirmationModal/index';

const ModalContainer = () => {
  const { currentModal, hideModal } = useModalStore();

  return (
    <>
      {currentModal === 'achievement' && (
        <AchievementModal onDismiss={hideModal} />
      )}

      {currentModal === 'confirmation' && (
        <ConfirmationModal onDismiss={hideModal} />
      )}
    </>
  );
};

export default ModalContainer;
