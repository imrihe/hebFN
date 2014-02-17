/* start module: linearizeTal (1) */
$pyjs.loaded_modules['linearizeTal (1)'] = function (__mod_name__) {
	if($pyjs.loaded_modules['linearizeTal (1)'].__was_initialized__) return $pyjs.loaded_modules['linearizeTal (1)'];
	var $m = $pyjs.loaded_modules["linearizeTal (1)"];
	$m.__repr__ = function() { return "<module: linearizeTal (1)>"; };
	$m.__was_initialized__ = true;
	if ((__mod_name__ === null) || (typeof __mod_name__ == 'undefined')) __mod_name__ = 'linearizeTal (1)';
	$m.__name__ = __mod_name__;


	$m['open'] = $p['___import___']('codecs.open', null, null, false);
	$m['sys'] = $p['___import___']('sys', null);
	$m['sys']['path']['append']('.');
	$m['dicfile'] = $m['open']($p['getattr']($m['sys'], 'argv').__getitem__(3), 'r', 'utf-8');
	$m['lines'] = $m['dicfile']['readlines']();
	$m['letters'] = $m['lines'].__getitem__(2)['encode']('utf-8')['strip']()['$$split']('#');
	$m['shin'] = $m['letters'].__getitem__(2);
	$m['mem'] = $m['letters'].__getitem__(1);
	$m['vav'] = $m['letters'].__getitem__(3);
	$m['suffixes'] = function(){
		var $iter1_nextval,$iter1_type,$collcomp1,$iter1_iter,$iter1_idx,$iter1_array;
	$collcomp1 = $p['list']();
	$iter1_iter = $p['zip']($m['lines'].__getitem__(4)['encode']('utf-8')['strip']()['$$split']('~'), $m['lines'].__getitem__(5)['encode']('utf-8')['strip']()['$$split']('~'));
	$iter1_nextval=$p['__iter_prepare']($iter1_iter,false);
	while (typeof($p['__wrapped_next']($iter1_nextval).$nextval) != 'undefined') {
		var $tupleassign1 = $p['__ass_unpack']($iter1_nextval.$nextval, 2, null);
		$m['word'] = $tupleassign1[0];
		$m['suff'] = $tupleassign1[1];
		$collcomp1['append']($p['tuple']([$m['word'], $m['suff']]));
	}

	return $collcomp1;}();
	$m['linearize'] = function(sentence) {
		var pos,linearizeType,previous,$iter2_iter,$iter2_type,memo,$iter2_idx,$add10,$iter2_nextval,word,linearized,$add2,$add3,$add1,$add6,$add7,$add4,$add5,$add8,$add9,$iter2_array;
		linearized = '';
		previous = '';
		memo = false;
		$iter2_iter = sentence;
		$iter2_nextval=$p['__iter_prepare']($iter2_iter,false);
		while (typeof($p['__wrapped_next']($iter2_nextval).$nextval) != 'undefined') {
			var $tupleassign2 = $p['__ass_unpack']($iter2_nextval.$nextval, 2, null);
			word = $tupleassign2[0];
			pos = $tupleassign2[1];
			var $tupleassign3 = $p['__ass_unpack']((typeof linearizationType == "undefined"?$m.linearizationType:linearizationType)(word, pos, previous, memo), 2, null);
			linearizeType = $tupleassign3[0];
			memo = $tupleassign3[1];
			if ($p['bool']((previous === 'Prefix'))) {
				linearized = $p['__op_add']($add1=linearized,$add2=word);
			}
			else if ($p['bool']((linearizeType === 'swallowTheHePrep'))) {
				continue;
			}
			else if ($p['bool']((linearizeType === 'PostfixPunct'))) {
				linearized = $p['__op_add']($add3=linearized,$add4=word);
			}
			else if ($p['bool'](linearizeType['startswith']('prn'))) {
				linearized = $p['__op_add']($add5=linearized,$add6=linearizeType['$$split']('_').__getitem__((typeof ($usub1=1)=='number'?
					-$usub1:
					$p['op_usub']($usub1))));
			}
			else {
				linearized = $p['__op_add']($add9=$p['__op_add']($add7=linearized,$add8=' '),$add10=word);
			}
			previous = linearizeType;
		}
		return linearized;
	};
	$m['linearize'].__name__ = 'linearize';

	$m['linearize'].__bind_type__ = 0;
	$m['linearize'].__args__ = [null,null,['sentence']];
	$m['linearizationType'] = function(word, pos, previous, memo) {
		var $and1,$add11,$add12,$and2;
		if ($p['bool']((typeof agglutinatedWord == "undefined"?$m.agglutinatedWord:agglutinatedWord)(pos, word, previous))) {
			if ($p['bool']($p['list']([$m['mem'], $m['shin'], $m['vav']]).__contains__(word['encode']('utf-8')['strip']()))) {
				return $p['tuple'](['Prefix', memo]);
			}
			if ($p['bool'](($p['bool']($and1=(pos === 'DEF'))?(previous === 'swallowTheHePrep'):$and1))) {
				return $p['tuple'](['Empty', memo]);
			}
			if ($p['bool']((pos === 'PREPOSITION'))) {
				return $p['tuple'](['swallowTheHePrep', memo]);
			}
			else {
				return $p['tuple'](['Prefix', memo]);
			}
		}
		else if ($p['bool']((typeof punctuation == "undefined"?$m.punctuation:punctuation)(pos))) {
			if ($p['bool']($p['list']([',', '.', ';', ':', '?', '!', ')', ']']).__contains__(word))) {
				return $p['tuple'](['PostfixPunct', memo]);
			}
			if ($p['bool']($p['list'](['"', "'"]).__contains__(word))) {
				if ($p['bool'](memo)) {
					return $p['tuple'](['PostfixPunct', false]);
				}
				else {
					return $p['tuple'](['Prefix', true]);
				}
			}
			if ($p['bool']($p['list'](['(', '[']).__contains__(word))) {
				return $p['tuple'](['Prefix', memo]);
			}
			else {
				return $p['tuple'](['Regular', memo]);
			}
		}
		else if ($p['bool']((typeof s_prnInflection == "undefined"?$m.s_prnInflection:s_prnInflection)(pos, word))) {
			return $p['tuple']([$p['__op_add']($add11='prn_',$add12=(typeof getSuffixPrn == "undefined"?$m.getSuffixPrn:getSuffixPrn)(word)), memo]);
		}
		else {
			return $p['tuple'](['Regular', memo]);
		}
		return null;
	};
	$m['linearizationType'].__name__ = 'linearizationType';

	$m['linearizationType'].__bind_type__ = 0;
	$m['linearizationType'].__args__ = [null,null,['word'],['pos'],['previous'],['memo']];
	$m['agglutinatedWord'] = function(pos, word, previous) {
		var $and4,$and3;
		return ($p['bool']($and3=$p['list'](['PREPOSITION', 'CONJ', 'REL-SUBCONJ', 'DEF']).__contains__($p['str'](pos)))?$m['letters'].__contains__(word['encode']('utf-8')):$and3);
	};
	$m['agglutinatedWord'].__name__ = 'agglutinatedWord';

	$m['agglutinatedWord'].__bind_type__ = 0;
	$m['agglutinatedWord'].__args__ = [null,null,['pos'],['word'],['previous']];
	$m['getSuffixPrn'] = function(word) {

		return $p['dict']($m['suffixes']).__getitem__(word['strip']()['$$split']('~').__getitem__(0));
	};
	$m['getSuffixPrn'].__name__ = 'getSuffixPrn';

	$m['getSuffixPrn'].__bind_type__ = 0;
	$m['getSuffixPrn'].__args__ = [null,null,['word']];
	$m['s_prnInflection'] = function(pos, word) {

		return $p['list'](['S_PRN']).__contains__(pos);
	};
	$m['s_prnInflection'].__name__ = 's_prnInflection';

	$m['s_prnInflection'].__bind_type__ = 0;
	$m['s_prnInflection'].__args__ = [null,null,['pos'],['word']];
	$m['punctuation'] = function(pos) {

		return $p['list'](['PUNC']).__contains__(pos);
	};
	$m['punctuation'].__name__ = 'punctuation';

	$m['punctuation'].__bind_type__ = 0;
	$m['punctuation'].__args__ = [null,null,['pos']];
	return this;
}; /* end linearizeTal (1) */


/* end module: linearizeTal (1) */


/*
PYJS_DEPS: ['codecs.open', 'codecs', 'sys']
*/
