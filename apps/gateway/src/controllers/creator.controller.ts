import { Controller } from '@nestjs/common';
import { InjectClient, type InternalService } from '@unaplauso/services';

@Controller('creator')
export class CreatorController {
	constructor(@InjectClient() private readonly client: InternalService) {}

	/** // TODO:
	 * readCreator -> PER USERNAME O PER ID bio, no email
	 *     eventservice creator_read, payload id: number
	 * top 10 -> materialized view (24hs refresh) + redis caché
	 * listCreator -> con varios criterios de búsqueda, importante topicId
	 * 		CAMBIAR "listFavoriteCreatorQuery" CON CREATOR_TOP CUANDO ESTÉ
	 */
}
