import {QualityAction} from '../quality-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {Innovation} from '../buff/innovation';

export class InnovativeTouch extends QualityAction {

    execute(simulation: Simulation): void {
        super.execute(simulation);
        const innovation = new Innovation();
        // If innovation is already persent, refresh it
        if (simulation.hasBuff(Buff.INNOVATION)) {
            simulation.getBuff(Buff.INNOVATION).stacks = innovation.getDuration(simulation);
        } else {
            simulation.buffs.push({
                appliedStep: simulation.steps.length,
                stacks: innovation.getInitialStacks(),
                buff: innovation.getBuff(),
                tick: innovation.getTick(),
                duration: innovation.getDuration(simulation)
            });
        }
    }

    canBeUsed(simulationState: Simulation): boolean {
        return simulationState.crafterStats.specialist;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 8;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 0;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 40;
    }

    getIds(): number[] {
        return [100137, 100138, 100139, 100140, 100141, 100142, 100143, 100144];
    }

    getPotency(simulation: Simulation): number {
        return 100;
    }

}
