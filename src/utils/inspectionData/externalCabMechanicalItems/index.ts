
import { InspectionItem } from "@/types";
import { externalCabItems } from './externalCabItems';
import { fifthWheelItems } from './fifthWheelItems';
import { otherItems } from './otherItems';
import { tiltCabItems } from './tiltCabItems';
import { coolingSystemItems } from './coolingSystemItems';
import { engineItems } from './engineItems';
import { frontAxleItems } from './frontAxleItems';
import { gearboxItems } from './gearboxItems';
import { propshaftItems } from './propshaftItems';
import { forwardRearAxleItems } from './forwardRearAxleItems';
import { rearAxleItems } from './rearAxleItems';
import { steeringSystemItems } from './steeringSystemItems';

// Combine all external cab mechanical items
export const externalCabMechanicalItems: InspectionItem[] = [
  ...externalCabItems,
  ...fifthWheelItems,
  ...otherItems,
  ...tiltCabItems,
  ...coolingSystemItems,
  ...engineItems,
  ...frontAxleItems,
  ...gearboxItems,
  ...propshaftItems,
  ...forwardRearAxleItems,
  ...rearAxleItems,
  ...steeringSystemItems
];
