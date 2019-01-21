import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import stream from 'getstream';

const client = stream.connect('bf5kra2xwhbs', 'cb3vmdyjhv4va3tg5j8d46jmkx7bh6umkmcutke9exfg78ghbwb4xavj6zvpnvss', '46377');

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	api.post('/get-user-token', (req, res) => {
		const userAddress = req.body.userAddress;
		const token = client.createUserToken(userAddress);
		console.log(`/get-user-token requested - result ${token}`);
		res.json({ token })
	})

	api.post('/achievements/create', async (req, res) => {
		const { userAddress, link, title } = req.body;
		const achievement = client.feed('achievement', userAddress);
		const actor = await client.user(userAddress).get();
		await achievement.addActivity({
			actor,
			verb: 'create',
			object: link,
			title,
			time: new Date(),
			to: [
				`timeline:${userAddress}`,
				`achievement_aggregated:${userAddress}`,
				`achievement_aggregated:common`
			]
		})
		console.log('Achievement created')
		res.json({ ok: true })
	})

	api.post('/achievements/confirm', async (req, res) => {
		const { userAddress, link, creatorAddress } = req.body;
		const achievement = client.feed('achievement', creatorAddress);
		const actor = await client.user(userAddress).get();
		await achievement.addActivity({
			actor,
			verb: 'confirm',
			object: link,
			time: new Date(),
			to: [
				`timeline:${userAddress}`,
				`timeline:${creatorAddress}`,
				`achievement_aggregated:${creatorAddress}`,
				`achievement_aggregated:common`
			]
		})
		console.log('Achievement confirmed')
		res.json({ ok: true })
	})


	api.post('/achievements/support', async (req, res) => {
		const { userAddress, link, amount, blockchain, creatorAddress } = req.body;
		const achievement = client.feed('achievement', creatorAddress);
		const actor = await client.user(userAddress).get();
		await achievement.addActivity({
			actor,
			blockchain,
			verb: 'support',
			object: link,
			amount,
			time: new Date(),
			to: [
				`timeline:${userAddress}`,
				`timeline:${creatorAddress}`,
				`achievement_aggregated:${creatorAddress}`,
				`achievement_aggregated:common`
			]
		})
		console.log('Achievement supported')
		res.json({ ok: true })
	})

	api.post('/timeline/')

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
