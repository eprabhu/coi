import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExpandedWidgetsComponent } from './expanded-widgets.component';

const routes: Routes = [
  {
    path: '', component: ExpandedWidgetsComponent,
    children: [
      {
        path: 'research-summary-list', loadChildren: () => import('./research-summary-expanded-view/research-summary-expanded-view.module')
          .then(m => m.ResearchSummaryExpandedViewModule)
      },
      {
        path: 'fibi-support', loadChildren: () => import('./support-expanded-view/support-expanded-view.module')
          .then(m => m.SupportExpandedViewModule)
      },
      {
        path: 'award-by-sponsor', loadChildren: () => import('./award-by-sponsor-types-expanded-view/award-by-sponsor-types-expanded-view.module')
          .then(m => m.AwardBySponsorTypesExpandedViewModule)
      },
      {
        path: 'inprogress-proposal-by-sponsor',
        loadChildren: () => import('./inprogress-proposal-expaned-view/inprogress-proposal-expaned-view.module')
          .then(m => m.InprogressProposalExpanedViewModule)
      },
      {
        path: 'proposal-by-sponsor',
        loadChildren: () => import('./proposal-by-sponsor-expanded-view/proposal-by-sponsor-expanded-view.module')
          .then(m => m.ProposalBySponsorExpandedViewModule)
      },
      {
        path: 'action-list', loadChildren: () => import('./expanded-action-list/expanded-action-list.module')
          .then(m => m.ExpandedActionListModule)
      },
      {
        path: 'ip-by-sponsor',
         loadChildren: () => import('./awarded-proposal-by-sponsor-expanded-view/awarded-proposal-by-sponsor-expanded-view.module')
          .then(m => m.AwardedProposalBySponsorExpandedViewModule)
      },
      {
        path: 'awards-by-sponsor', loadChildren: () => import('./expanded-awards-by-sponsor/expanded-awards-by-sponsor.module')
          .then(m => m.ExpandedAwardsBySponsorModule)
      },
      {
        path: 'expanded-view', loadChildren: () => import('./expanded-view/expanded-view.module')
          .then(m => m.ExpandedViewModule)
      },
      {
        path: 'pending-proposal-sponsor', loadChildren: () => import('./pending-proposal-of-sponsor/pending-proposal-of-sponsor.module')
          .then(m => m.PendingProposalOfSponsorModule)
      },
      {
        path: 'ip-leadunit', loadChildren: () => import('./institude-proposal-lead-unit-expanded-view/institute-proposal-lead-unit-expanded-view.module')
          .then(m => m.InstituteProposalLeadUnitExpandedViewModule)
      },
      {
        path: 'ip-by-sponsored', loadChildren: () => import('./institute-proposal-by-sponsor-expanded-view/institute-proposal-by-sponsor-expanded-view.module')
          .then(m => m.InstituteProposalBySponsorExpandedViewModule)
      }
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})

export class ExpandedWidgetsRoutingModule { }
