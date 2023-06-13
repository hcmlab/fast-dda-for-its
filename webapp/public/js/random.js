function makeid(length)
{
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ )
	{
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function randomNoRepeat(max_rnd, repeats)
{
	var rnd = -1;

	while(rnd == -1 || repeats.indexOf(rnd) != -1)
	{
		rnd = Math.floor(Math.random() * max_rnd) + 1;
	}

	return rnd;
}

function randomPerm(arr)
{
	let perm = [].concat(arr);
    
	for(var idx = 0; idx < perm.length; idx++)
	{
		var swpIdx = idx + Math.floor(Math.random() * (perm.length - idx));
		// now swap elements at idx and swpIdx
		var tmp = perm[idx];
		perm[idx] = perm[swpIdx];
		perm[swpIdx] = tmp;
	}

	return perm;
}