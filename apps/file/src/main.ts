import { DATABASE_CONNECTION, type Database } from '@unaplauso/database/module';
import { bootstrapService } from '@unaplauso/services';
import { FileModule } from './file.module';
import { FileService } from './file.service';

bootstrapService(FileModule, async (app) => {
	const fileService = app.get(FileService);
	const db: Database = app.get(DATABASE_CONNECTION);

	const client = await db.$client.connect();
	await client.query('LISTEN file_deleted');
	client.on(
		'notification',
		async (v) =>
			v.channel === 'file_deleted' &&
			v.payload &&
			fileService.deleteFileFromS3(JSON.parse(v.payload)),
	);
});
