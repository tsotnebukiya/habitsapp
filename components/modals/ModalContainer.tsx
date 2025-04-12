import React from 'react';
import { useModalStore } from '@/lib/stores/modal_store';
import AchievementModal from './Achievements';
import ConfirmationModal from './Confirmations';
import AchievementsModal from './Achievements';

const ModalContainer = () => {
  const { currentModal, hideModal } = useModalStore();

  return (
    <>
      {currentModal === 'achievement' && (
        <AchievementsModal onDismiss={hideModal} />
      )}

      {currentModal === 'confirmation' && (
        <ConfirmationModal onDismiss={hideModal} />
      )}
    </>
  );
};

export default ModalContainer;
