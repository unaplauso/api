import { Controller } from '@nestjs/common';
import { InjectClient, type InternalService } from '@unaplauso/services';

@Controller('donation')
export class DonationController {
	constructor(@InjectClient() private readonly client: InternalService) {}

	/** // TODO:
	 * listDonationPerCreator -> con paginación, order por fecha desc, incluir comments y tal
	 * listTopDonationPerCreator -> con paginación default 5, order por aplausos
	 * -
	 * listDonationPerProject -> equivalente al de arriba pero para project
	 * listTopDonationPerCreator -> equivalente al de arriba pero para project
	 * -
	 * readCollectedPerUser -> jwtProtected, suma de la plata recaudada, number
	 * -
	 * createDonation -> post NO JWTPROTECTED! mercado pago pay, averiguar
	 */
}
