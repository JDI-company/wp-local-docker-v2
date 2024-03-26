const { join } = require( 'path' );
const { writeFile } = require( 'fs' ).promises;
const axios = require( 'axios' );

const { globalPath } = require( '../../env-utils' );
const config = require( '../../configure' );

async function downloadDevcontainer( spinner, devcontainerPath ) {
	try {
		const response = await axios.get( devcontainerPath, { responseType: 'arraybuffer' } );
		const responseData = Buffer.from( response.data, 'binary' ).toString();
		return responseData;
	} catch ( error ) {
		if ( spinner ) {
			spinner.fail( 'An error occurred while fetching Devcontainer URL' );
		} else {
			console.error( `An error occurred while fetching Devcontainer URL file. Error: ${  error.message }` );
		}
	}
}

module.exports = function makeDevcontainer( spinner, { copy, ensureDir } ) {
	return async ( { paths, devcontainer } ) => {
		if ( devcontainer !== true ) {
			return;
		}

		const devcontainerPath = await config.get( 'devcontainerPath' );
		const envPath = paths['/'];

		if( devcontainerPath.includes( 'http' ) ) {
			await ensureDir( join( envPath, '.devcontainer' ) );

			await writeFile(
				join( envPath, '.devcontainer', 'devcontainer.json' ),
				await downloadDevcontainer( spinner, devcontainerPath )
			);
		} else {
			await copy( join( globalPath, '.devcontainer' ), join( envPath, '.devcontainer' ) );
		}

		if ( spinner ) {
			spinner.succeed( 'Devcontainer file is copied...' );
		} else {
			console.log( 'Copied Devcontainer file.' );
		}
	};
};
