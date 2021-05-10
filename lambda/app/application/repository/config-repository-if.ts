import { SiteInfo } from '../../domain/model/site-info';

export interface IConfigRepository {
  getSiteInfo(): Promise<SiteInfo>
}
