import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { initialState as workshopsInitialState, workshopsReducer } from './+state/workshops.reducer';
import { WorkshopsEffects } from './+state/workshops.effects';
import { WorkshopsFacade } from './+state/workshops.facade';
import { DatabaseModule } from '../../core/database/database.module';
import { WorkshopPanelComponent } from './workshop-panel/workshop-panel.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule } from '../list/list.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { CoreModule } from '../../core/core.module';
import { ClipboardModule } from 'ngx-clipboard';
import { CustomLinksModule } from '../custom-links/custom-links.module';
import { ListPickerModule } from '../list-picker/list-picker.module';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    NgZorroAntdModule,
    FlexLayoutModule,
    NgxDnDModule,
    CoreModule,
    ClipboardModule,
    CustomLinksModule,

    DatabaseModule,
    ListModule,
    ListPickerModule,

    StoreModule.forFeature('workshops', workshopsReducer, {
      initialState: workshopsInitialState
    }),
    EffectsModule.forFeature([WorkshopsEffects])
  ],
  declarations: [WorkshopPanelComponent],
  exports: [WorkshopPanelComponent],
  providers: [WorkshopsFacade]
})
export class WorkshopModule {
}
