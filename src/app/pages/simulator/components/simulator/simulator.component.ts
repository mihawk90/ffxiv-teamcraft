import {Component, Input} from '@angular/core';
import {Craft} from '../../../../model/garland-tools/craft';
import {Simulation} from '../../simulation/simulation';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {CraftingAction} from '../../model/actions/crafting-action';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CrafterStats} from '../../model/crafter-stats';
import {SimulationReliabilityReport} from '../../simulation/simulation-reliability-report';
import {SimulationResult} from '../../simulation/simulation-result';
import {ActionType} from '../../model/actions/action-type';
import {CraftingActionsRegistry} from '../../model/crafting-actions-registry';
import {ObservableMedia} from '@angular/flex-layout';
import {GearSet} from '../../model/gear-set';
import {UserService} from '../../../../core/database/user.service';
import {DataService} from '../../../../core/api/data.service';
import {HtmlToolsService} from '../../../../core/tools/html-tools.service';
import {EffectiveBuff} from '../../model/effective-buff';
import {Buff} from 'app/pages/simulator/model/buff.enum';

@Component({
    selector: 'app-simulator',
    templateUrl: './simulator.component.html',
    styleUrls: ['./simulator.component.scss']
})
export class SimulatorComponent {

    @Input()
    itemId: number;

    @Input()
    itemIcon: number;

    @Input()
    public customMode = false;

    private recipe$: ReplaySubject<Craft> = new ReplaySubject<Craft>(1);

    @Input()
    public set recipe(recipe: Craft) {
        this.recipe$.next(recipe);
    }

    private crafterStats$: ReplaySubject<CrafterStats> = new ReplaySubject<CrafterStats>(1);

    @Input()
    public set crafterStats(stats: CrafterStats) {
        this.crafterStats$.next(stats);
    }

    private actions$: BehaviorSubject<CraftingAction[]> = new BehaviorSubject<CraftingAction[]>([]);

    @Input()
    public set actions(actions: CraftingAction[]) {
        this.actions$.next(actions);
    }

    private hqIngredients$: BehaviorSubject<{ id: number, amount: number }[]> =
        new BehaviorSubject<{ id: number, amount: number }[]>([]);

    @Input()
    public set hqIngredients(ingredients: { id: number, amount: number }[]) {
        this.hqIngredients$.next(ingredients);
    }

    public simulation$: Observable<Simulation>;

    public result$: Observable<SimulationResult>;

    public report$: Observable<SimulationReliabilityReport>;

    public gearsets$: Observable<GearSet[]>;

    public customSet = false;

    public selectedSet: GearSet;

    public hqIngredientsData: { id: number, amount: number, max: number, quality: number }[] = [];

    constructor(private registry: CraftingActionsRegistry, private media: ObservableMedia, private userService: UserService,
                private dataService: DataService, private htmlTools: HtmlToolsService) {
        this.recipe$.subscribe(recipe => {
            this.hqIngredientsData = recipe.ingredients
                .filter(i => i.id > 20)
                .map(ingredient => ({id: ingredient.id, amount: 0, max: ingredient.amount, quality: ingredient.quality}));
        });

        this.gearsets$ = this.userService.getUserData()
            .mergeMap(user => {
                if (user.anonymous) {
                    return Observable.of([])
                }
                return this.dataService.getGearsets(user.lodestoneId);
            });

        this.simulation$ = Observable.combineLatest(
            this.recipe$,
            this.actions$,
            this.crafterStats$,
            this.hqIngredients$,
            (recipe, actions, stats, hqIngredients) => new Simulation(recipe, actions, stats, hqIngredients)
        );

        if (!this.customMode) {
            Observable.combineLatest(this.recipe$, this.gearsets$, (recipe, gearsets) => {
                let userSet = gearsets.find(set => set.jobId === recipe.job);
                if (userSet === undefined) {
                    userSet = {
                        ilvl: 0,
                        control: 1000,
                        craftsmanship: 1000,
                        cp: 450,
                        jobId: 10,
                        level: 70,
                        specialist: false
                    };
                }
                return userSet;
            }).subscribe(set => {
                this.selectedSet = set;
                this.applyStats(set);
            });
        }

        this.result$ = this.simulation$.map(simulation => simulation.run(true));

        this.report$ = this.result$
            .filter(res => res.success)
            .mergeMap(() => this.simulation$)
            .map(simulation => simulation.getReliabilityReport());
    }

    getStars(nb: number): string {
        return this.htmlTools.generateStars(nb);
    }

    getBuffIcon(effBuff: EffectiveBuff): string {
        return `./assets/icons/status/${Buff[effBuff.buff].toLowerCase()}.png`;
    }

    moveSkill(originIndex: number, targetIndex: number): void {
        const actions = this.actions$.getValue();
        actions.splice(targetIndex, 0, actions.splice(originIndex, 1)[0]);
        this.actions$.next(actions);
    }

    applyStats(set: GearSet): void {
        this.crafterStats = new CrafterStats(
            set.jobId,
            set.craftsmanship,
            set.control,
            set.cp,
            set.specialist,
            set.level);
    }

    addAction(action: CraftingAction): void {
        this.actions$.next(this.actions$.getValue().concat(action));
    }

    removeAction(index: number): void {
        const rotation = this.actions$.getValue();
        rotation.splice(index, 1);
        this.actions$.next(rotation);
    }

    getProgressActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.PROGRESSION);
    }

    getQualityActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.QUALITY);
    }

    getCpRecoveryActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.CP_RECOVERY);
    }

    getBuffActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.BUFF);
    }

    getSpecialtyActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.SPECIALTY);
    }

    getRepairActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.REPAIR);
    }

    getOtherActions(): CraftingAction[] {
        return this.registry.getActionsByType(ActionType.OTHER);
    }

    isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }
}
