import { useModalStore } from '@/lib/stores/modal_store';
import React from 'react';
import AchievementsModal from './Achievements';
import SortModal from './SortModal';

const ModalContainer = () => {
  const { currentModal, hideModal } = useModalStore();

  return (
    <>
      {currentModal === 'achievement' && (
        <AchievementsModal onDismiss={hideModal} />
      )}

      {currentModal === 'sort' && <SortModal onDismiss={hideModal} />}
    </>
  );
};

export default ModalContainer;
