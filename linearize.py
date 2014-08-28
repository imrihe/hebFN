#!/usr/bin/env python
# encoding:utf-8
#מ#ש#ו#ב#כ#ל#ה#
#ב#כ#ל#מ#ו#ה#ש#ו
#~היא~הוא~הם~הן~
#~ה~ו~ם~ן~

# Linearize sentences given analyzed (word,pos) list

###these lines are important

from codecs import open
import sys
sys.path.append(".")

#translate the hebrew treebank files with phonemic Hebrew into utf8
#I made these to be global, but i can change that
#inputFile=sys.argv[1]

#python heb_conllXtostandoff -o outputdir linearizeTal nameofconllfile
dicfile=open(sys.argv[3],"r","utf-8") #i use this self code file to read the letters in Hebrew from a comment
lines=dicfile.readlines()
letters= lines[2].encode('utf-8').strip().split('#')
shin=letters[2]
mem=letters[1]
vav=letters[3]
suffixes=[(word,suff) for word,suff in zip(lines[4].encode('utf-8').strip().split('~'), lines[5].encode('utf-8').strip().split('~'))]


def linearize(sentence):  # a sentence is a list of (word,pos)
	#print "in linearize"
	linearized=""
	previous=""
	memo=False
	for (word,pos) in sentence: #no space after
		
		(linearizeType,memo)=linearizationType(word,pos,previous,memo) 
		
		if previous is 'Prefix':
			linearized=linearized + word

		elif linearizeType is 'swallowTheHePrep':
			#dont do anythong
			continue
		elif linearizeType is 'PostfixPunct':
			linearized=linearized+word
		elif linearizeType.startswith("prn"):
			linearized=linearized+linearizeType.split('_')[-1]
		else:
			linearized=linearized+ " " + word

		previous=linearizeType

	
	return linearized



def linearizationType(word,pos,previous,memo): #if previous is 
	
	if agglutinatedWord(pos,word,previous):
		if word.encode('utf-8').strip() in [mem,shin,vav]:
			#print 'wow'
			return ('Prefix',memo)
		if pos is 'DEF' and previous is 'swallowTheHePrep':
			return('Empty',memo)

		if pos is 'PREPOSITION':
			return ('swallowTheHePrep',memo)
		else:
			return ('Prefix',memo)
	elif punctuation(pos):
		if word in [',','.',';',':','?','!',')',']']:
			return ('PostfixPunct',memo)
		if word in ['"',"'"]:
			if memo : #now closing, postfix
				return ('PostfixPunct', False) #close memo, flag false
			else:
				return ('Prefix', True)
		if word in ['(','[']:
				return ('Prefix',memo)
		else:
			return('Regular',memo)
	elif s_prnInflection(pos,word):
		
		return ('prn_'+getSuffixPrn(word), memo)
	else:
		return('Regular',memo)



def agglutinatedWord(pos,word,previous):
	#print word.encode('utf-8')
	return (str(pos) in ['PREPOSITION','CONJ','REL-SUBCONJ', 'DEF'] and word.encode('utf-8') in letters)

		
def getSuffixPrn(word):
	return dict(suffixes)[word.strip().split('~')[0]]
			
def s_prnInflection(pos,word):
	return (pos in ['S_PRN'])
		

def punctuation(pos):
	return (pos in ['PUNC'])
		





