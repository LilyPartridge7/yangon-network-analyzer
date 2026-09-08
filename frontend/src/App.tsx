import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { PresentationBar, PRESENTATION_STEPS } from './components/layout/PresentationBar';
import { DashboardPage } from './pages/DashboardPage';
import { RouteExplorerPage } from './pages/RouteExplorerPage';
import { MatrixLabPage } from './pages/MatrixLabPage';
import { FlowLabPage } from './pages/FlowLabPage';
import { CyclesLabPage } from './pages/CyclesLabPage';
import { DisruptionLabPage } from './pages/DisruptionLabPage';
import { TheoryPage } from './pages/TheoryPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [presentationStepIndex, setPresentationStepIndex] = useState<number>(0);

  // Sync presentation step with page tab
  const handleSelectPresentationStep = (index: number) => {
    setPresentationStepIndex(index);
    const step = PRESENTATION_STEPS[index];
    if (step) {
      setCurrentTab(step.tab);
    }
  };

  const handleNextStep = () => {
    if (presentationStepIndex < PRESENTATION_STEPS.length - 1) {
      handleSelectPresentationStep(presentationStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (presentationStepIndex > 0) {
      handleSelectPresentationStep(presentationStepIndex - 1);
    }
  };

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentationMode) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevStep();
      } else if (e.key === 'Escape') {
        setIsPresentationMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, presentationStepIndex]);

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${
      isPresentationMode ? 'text-[15px]' : 'text-sm'
    }`}>
      {/* Presentation Bar (Fixed top when active) */}
      {isPresentationMode && (
        <PresentationBar
          currentStepIndex={presentationStepIndex}
          onPrev={handlePrevStep}
          onNext={handleNextStep}
          onExit={() => setIsPresentationMode(false)}
          onSelectStep={handleSelectPresentationStep}
        />
      )}

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
          }}
          isPresentationMode={isPresentationMode}
          onTogglePresentation={() => {
            setIsPresentationMode(!isPresentationMode);
            if (!isPresentationMode) {
              setPresentationStepIndex(0);
              setCurrentTab(PRESENTATION_STEPS[0].tab);
            }
          }}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && <DashboardPage />}
            {currentTab === 'routing' && <RouteExplorerPage />}
            {currentTab === 'matrix-lab' && <MatrixLabPage />}
            {currentTab === 'flow-lab' && <FlowLabPage />}
            {currentTab === 'cycles' && <CyclesLabPage />}
            {currentTab === 'disruption' && <DisruptionLabPage />}
            {currentTab === 'theory' && <TheoryPage />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
