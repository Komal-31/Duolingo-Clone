'use client';

import React, { useMemo, useState } from 'react';
import { UnitDetailResponse, SkillSummaryResponse } from '@/types/course';
import { UnitBanner } from './UnitBanner';
import { SkillNode } from './SkillNode';
import { LessonPopover } from './LessonPopover';

interface LearningPathProps {
  units: UnitDetailResponse[];
}

/** Builds enriched skill data with offset + isCurrentActive derived from units */
function buildEnrichedSkills(units: UnitDetailResponse[]) {
  const offsets = [0, 45, 75, 45, 0, -45, -75, -45];
  let counter = 0;
  let foundActive = false;

  return units.map((unit) => ({
    ...unit,
    skills: unit.skills.map((skill) => {
      const offset = offsets[counter % offsets.length];
      counter += 1;

      const isCompleted =
        skill.status === 'completed' ||
        (skill.total_lessons > 0 && skill.completed_lessons >= skill.total_lessons);
      const isLocked = skill.status === 'locked';

      let isCurrentActive = false;
      if (!isCompleted && !isLocked && !foundActive) {
        isCurrentActive = true;
        foundActive = true;
      }

      return { skill, offset, isCurrentActive };
    }),
  }));
}

export const LearningPath: React.FC<LearningPathProps> = ({ units }) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillSummaryResponse | null>(null);

  // Derive enriched data from props — stable unless units change
  const enrichedUnits = useMemo(() => buildEnrichedSkills(units), [units]);

  return (
    <div className="mx-auto w-full max-w-xl pb-24 pt-2 px-2 sm:px-4">
      {enrichedUnits.map((unit, unitIdx) => (
        <section key={unit.id} className="mb-14">
          {/* Unit Header Banner */}
          <UnitBanner
            unitIndex={unitIdx + 1}
            title={unit.title}
            description={unit.description}
          />

          {/* Vertical Winding Path of Skill Nodes */}
          <div className="relative flex flex-col items-center">
            {unit.skills.map(({ skill, offset, isCurrentActive }) => (
              <SkillNode
                key={skill.id}
                skill={skill}
                horizontalOffset={offset}
                isCurrentActive={isCurrentActive}
                onClick={(clickedSkill) => setSelectedSkill(clickedSkill)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Popover when clicking an unlocked or completed skill */}
      <LessonPopover
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
      />
    </div>
  );
};
