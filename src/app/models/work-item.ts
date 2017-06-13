import { WorkItemType } from './work-item-type';
import { AreaModel } from './area.model';
import { Comments, Comment } from './comment';
import { Link } from './link';
import { User } from 'ngx-login-client';
import { IterationModel } from './iteration.model';

export class WorkItem {
  hasChildren?: boolean;
  attributes: object = {};
  id: string;
  relationships?: WorkItemRelations;
  type: string;
  relationalData?: RelationalData;
  links?: {
    self: string;
    sourceLinkTypes?: string;
    targetLinkTypes?: string;
  };
}

export class WorkItemRelations {
  area: {
    data?: AreaModel
  };
  assignees: {
    data?: User[]
  };
  baseType: {
    data: WorkItemType;
  };
  children?: {
    links: {
      related: string;
    };
    meta: {
      hasChildren: boolean;
    };
  };
  links?: {
    links: {
      related: string;
    };
  };
  comments?: {
    data?: Comment[];
    links: {
      self: string;
      related: string;
    };
    meta?: {
      totalCount?: number;
    }
  };
  creator: {
    data: User;
  };
  iteration: {
    data?: IterationModel;
  };
  codebase?: {
    links: {
      meta: {
        edit: string;
      }
    }
  };
}

export class RelationalData {
  area?: AreaModel;
  creator?: User;
  comments?: Comment[];
  assignees?: User[];
  linkDicts?: LinkDict[];
  iteration?: IterationModel;
  totalLinkCount?: number;
  wiType?: WorkItemType;
}

export class LinkDict {
  linkName: any;
  links: Link[];
  count: number;
}
