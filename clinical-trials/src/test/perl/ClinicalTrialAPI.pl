use strict;
use warnings;
use Test::More;
use Try::Tiny;
use 5.10.0;
use Data::Dumper;
use REST::Client;
use JSON;

# copy from Firefox network tab headers
my $play_session = '
PLAY_FLASH=; PLAY_SESSION=1c13cdcd589fb3358ed75e2252690abb5169ed48-ix.session=8b31669e-500d-49e8-9e5b-4742b938c758
';

$play_session =~s/PLAY_FLASH=;//;
# remove all linefeeds 
$play_session =~s/\015?\012?$//;

#  Test data to load into GSRS 
#  .\inxight\modules\ginas\test\testdumps\repo90.ginas

my $substance_data_source  = 'rep4.gsrs';  # rep90|rep4 
my $baseUrl = 'http://localhost:8081';
# my $baseUrl = 'http://fdslv22019:8080';
my $basePath = '/api/v1';
# $basePath = '/ginas/app';
my $auth_username = 'admin';
my $auth_password = 'admin';


my $test_user_connection=0;



my $client = REST::Client->new();
$client->setHost($baseUrl);

$client->addHeader('charset', 'UTF-8');
$client->addHeader('Cookie', $play_session);

$client->addHeader('auth-username', $auth_username);
$client->addHeader('auth-password', $auth_password);


my $json = JSON->new->allow_nonref;

my $trialNumber_get = 'NCT04075565';
my $trialNumber_ne = 'NCT00000000';
my $trialNumber_create = 'NCT99999999';
my $trialNumber_delete = $trialNumber_create;

my $substanceKey_ne = '3345eae8-2d84-4a19-acf7-x6xx3xx022x5';  # made up uuid
my $substanceKey1;
my $substanceKey2;
my $substanceKey3;
my $substanceKey4;



# These substances have to exists and be indexed to work!!!!!
# These ones are in the ncts repo90.ginas test data set
if($substance_data_source eq 'rep4.gsrs') {
  $substanceKey1="044e6d9c-37c0-42ac-848e-2e41937216b1"; # "ACLERASTIDE"
  $substanceKey2="18de6ee4-3005-4785-9d11-dd8ccc589eb4"; # "MURINE RESPIROVIRUS (Z)"
  $substanceKey3="deb33005-e87e-4e7f-9704-d5b4c80d3023"; # "ASPARAGINASE ERWINIA CHRYSANTHEMI"
  $substanceKey4="b67893b0-68f0-4924-9ebb-3ebb932db965"; # "PLASMALYTE A"
} elsif($substance_data_source eq 'rep90.gsrs') {
  $substanceKey1="1db30542-0cc4-4098-9d89-8340926026e9"; #aspirin calcium
  $substanceKey2="fb0bb85e-36a8-49f5-b48c-fe84db45923c"; #LEUCOMYCIN A1 ACETATE
  $substanceKey3="cf8df6ce-b0c6-4570-a07a-118cd58a4e90"; #VERBESINA SATIVA WHOLE
  $substanceKey4="d42fd6c5-f0d5-49c0-bd81-502f161c1297"; #PANDANUS LOUREIROI WHOLE
} else {
  # make edits here as needed.
  $substanceKey1="09b782d8-d7bf-4099-b432-7da505d81459"; #pentane
  $substanceKey2="46fca64d-6ff3-42d2-a2c0-92a1c6fc65ed"; #zinc acetate
  $substanceKey3="3fce2c72-3383-4511-9bc6-fcc646d0462f"; #palmitic acid
  $substanceKey4="bd3f6640-1845-472f-b743-c8d77367576f"; #CANNABIDIOL
}

my $base_json = '
{
	"trialNumber": "NCTNUMBER",
	"title": "The Influence of GINkGo Biloba on the Pharmacokinetics of the UGT Substrate raltEgraviR (GINGER)",
	"recruitment": "Completed",
	"phases": "Phase 1",
	"kind": "US",
	"fundedBys": "Other|Industry",
	"studyTypes": "Interventional",
	"studyDesigns": "Allocation: Randomized|Intervention Model: Crossover Assignment|Masking: None (Open Label)",
	"studyResults": "No Results Available",
	"gender": "All",
	"enrollment": "18",
	"otherIds": "UMCN-AKF 10.02",
	"acronym": "GINGER",
	"completionDate": 990331200000,
	"primaryCompletionDate": 1551502800000,
	"url": "https://clinicaltrials.gov/show/NCTNUMBER",
	"locations": "CRCN, Radboud University Medical Centre, Nijmegen, Netherlands",
	"locationList": [],
	"sponsorList": [],
	"clinicalTrialUSDrug": [{
		"trialNumber": "NCTNUMBER",
		"substanceKey": "SUBSTANCEUUID1",
		"substanceKeyType": "UUID"
	}, {
		"trialNumber": "NCTNUMBER",
		"substanceKey": "SUBSTANCEUUID2",
		"substanceKeyType": "UUID"
	}],
	"clinicalTrialApplicationList": []
}
';

# ,
#	"creationDate": "990331200000",
#	"lastModifiedDate": "990331200000"
# 		"id": 104162,
#		"id": 104163,

$base_json =~ s/NCTNUMBER/NCT99999999/g;
$base_json =~ s/SUBSTANCEUUID1/$substanceKey1/g;
$base_json =~ s/SUBSTANCEUUID2/$substanceKey2/g;

#print $base_json;
#	my $decoded = $json->decode($base_json);
# exit;


# delete_helper($trialNumber_1, $substanceKey_1);
# delete_helper($trialNumber_1, $substanceKey_2);
# delete_helper($trialNumber_1, $substanceKey_3);

# delete to make sure it does not exist.


delete_helper($trialNumber_create);


## Test user connection ##
if (0) {

    my $message = 'Test user profile';
	my $condition = sub {
		my $decoded = shift;
		return (defined($decoded->{messages}) && $decoded->{messages}->[0] eq 'All is good!'); 
	};	
	my $args = {
		expected_status => 200, 
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "/ginas/app/testUP",
		condition => $condition,
		message => $message
	};
	if($test_user_connection) { 
	 test_get($args);
	}
}


{
	my $message = 'Get a non-existing trialNumber';
	my $condition = sub { 
		my $decoded = shift;
		return (defined($decoded->{message}) && $decoded->{message} eq "not found"); 
	};	
	my $args = {
		expected_status => 404, 
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialsus($trialNumber_ne)",
		condition => $condition,
		message => $message
	};
	test_get($args);
}




if (1) {
	my $message = 'Get many (page)';
	my $condition = sub { 
		my $decoded = shift; 
		return (
				defined($decoded->{content}) 
				&& ref $decoded->{content} eq 'ARRAY'
	#			&& scalar(@{$decoded->{content}}) > 1
		); 
	};
	my $args = {
		expected_status => 200, 
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialsus",
		condition => $condition,
		message => $message
	};
	
	test_get($args);
}
# exit;



{	
	# to Danny: if record alredy exists should get 409 but we're getting a 500 in this case. https://stackoverflow.com/questions/3825990/http-response-code-for-post-when-resource-already-exists
	# 'status' => 500,
    #        'message' => 'Object of class [gov.nih.ncats.gsrsspringcv2.ClinicalTrialUS] with identifier [NCT99999999]: optimistic locking failed; nested exception is org.hibernate.StaleObjectStateException: Row was updated or deleted by another transaction (or unsaved-value mapping was incorrect) : [gov.nih.ncats.gsrsspringcv2.ClinicalTrial#NCT99999999]'
    #      };
	
    # 500 Internal Server Error if no change is made.
	
	my $message = 'Test post - Create a new record.';
	my $data_string = $base_json;
	my $decoded = $json->decode($data_string);
	my $condition = sub {
		my $decoded = shift;
		return (defined($decoded->{trialNumber}) && $decoded->{trialNumber} eq $trialNumber_create); 
	};
	
	# print Data::Dumper->Dump([$decoded]);
	
	my $args = {
		expected_status => 201, 
		data => $decoded,
		dump_request_content => 1, 
		dump_request_perl_data => 0, 
		dump_response_content => 1, 	
		dump_response_perl_data => 0, 
	    url => "$basePath/clinicaltrialsus",
		condition => $condition,
		message => $message
	};	
	test_post($args);
}

# last post
# exit;


{
	my $message = 'Get many (page) when at least one exists';
	my $condition = sub { 
		my $decoded = shift; 
		return (
				defined($decoded->{content}) 
				&& ref $decoded->{content} eq 'ARRAY'
				&& scalar(@{$decoded->{content}}) ge 1
		); 
	};
	my $args = {
		expected_status => 200, 
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialsus",
		condition => $condition,
		message => $message
	};
	
	test_get($args);
}
# before first put
# exit;
{
	my $message = 'Test put - Update the record just created changing recruitment value.';
	my $data_string = get_to_json($trialNumber_create);
	my $decoded = $json->decode($data_string);
	$decoded->{recruitment} = 'XXXX';	
	my $condition = sub { 
		my $decoded = shift;
		return (defined($decoded->{trialNumber}) && $decoded->{trialNumber} eq $trialNumber_create && $decoded->{recruitment} eq 'XXXX'); 
	};
	my $args = {
		expected_status => 200, 
		data => $decoded,
		dump_request_content => 1, 
		dump_request_perl_data => 0, 
		dump_response_content => 1, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialsus",
		condition => $condition,
		message => $message
	};
	test_put($args);
}
# after first put
# exit;
{    
    my $message = 'Test put - Try to update with change one substance uuid';
	my $data_string = get_to_json($trialNumber_create);

	my $decoded = $json->decode($data_string);
	# $decoded->{recruitment} = 'XXXX';
	# $decoded->{gsrsUpdated} = 0;

	my $ctd = $decoded->{clinicalTrialUSDrug};	
	pop(@{$ctd}); 
	
	my $new = {};
	$new->{trialNumber} = $trialNumber_create;
	$new->{substanceKey} = $substanceKey4;
	$new->{substanceKeyType} = "UUID";
	push(@{$ctd}, $new ); 
	$decoded->{clinicalTrialUSDrug} = $ctd; 	
	# print $json->encode($decoded);
	my $condition = sub { 
		my $decoded = shift;
		return (!defined($decoded->{message})); 
	};
	my $args = {
		expected_status => 200, 
		data => $decoded,
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialsus",
		condition => $condition,
		message => $message
	};
	test_put($args);
}


{   
	my $message = 'Test put - Try to update with duplicate substanceKeys';
	my $data_string = get_to_json($trialNumber_create);
	my $decoded = $json->decode($data_string);
	$decoded->{recruitment} = 'DUPLICATE TEST';
	# $decoded->{gsrsUpdated} = 0;

	# note this won't work if both ids are not set because hashset collapses into one row.  
	# come back to this and maybe reconsider LinkedHashSet implementation.
		my $ctd = $json->decode('{
	"clinicalTrialUSDrug": [{
		"id": 99,
		"trialNumber": "'.$trialNumber_create.'",
		"substanceKey": "'.$substanceKey3.'",
		"substanceKeyType": "UUID"		
	},{
		"id": 98,
		"trialNumber": "'.$trialNumber_create.'",
		"substanceKey": "'.$substanceKey3.'",
		"substanceKeyType": "UUID"
	}
	]}');

	
	$decoded->{clinicalTrialUSDrug} = $ctd->{clinicalTrialUSDrug}; 	
	# print $json->encode($decoded);
	my $condition = sub { 
		my $decoded = shift;
		if(defined($decoded->{validationMessages})) {
			for my $vm (@{$decoded->{validationMessages}}) {
				if( $vm->{message} and $vm->{message} =~ /Substance .* a duplicate/i) { 
					return 1;
				}
			}		
		}
	};
	my $args = {
		expected_status => 400, 
		data => $decoded,
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialsus",
		condition => $condition,
		message => $message
	};
	test_put($args);
}





{    
    my $message = "Test PUT - Update a record that does not exist.";
	my $data_string = get_to_json($trialNumber_create);
	$data_string =~ s/$trialNumber_create/$trialNumber_ne/g;
	my $decoded = $json->decode($data_string);
	my $ctd = $json->decode('{
	"clinicalTrialUSDrug": [{
		"trialNumber": "'.$trialNumber_ne.'",
		"substanceKey": "'.$substanceKey1.'",
		"substanceKeyType": "UUID"
	},{
		"trialNumber": "'.$trialNumber_ne.'",
		"substanceKey": "'.$substanceKey2.'",
		"substanceKeyType": "UUID"
	}
	]}');
	$decoded->{clinicalTrialUSDrug} = $ctd->{clinicalTrialUSDrug}; 	
	
	my $condition = sub { 
		my $decoded = shift;
		
		return (defined($decoded->{message}) && $decoded->{message} =~ /Transaction silently rolled back because it has been marked as rollback-only/); 
		
		
	};
	
	my $args = {
		expected_status => 500, 
		data => $decoded,
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 1, 	
		dump_response_perl_data => 1, 
		url => "$basePath/clinicaltrialsus",
		condition => $condition,
		message => $message
	};
	test_put($args);
}

{    
    # 500 Internal Server Error if not change is made.
	# my $data_string = $base_json;
		
    my $message = "Test put - Update again with a changed recruitment value but change the ClinicalTrialUSDrug Object by removing one ct drug.";
	my $data_string = get_to_json($trialNumber_create);
	my $decoded = $json->decode($data_string);
	$decoded->{recruitment} = 'XXXX';
	my $ctd = $json->decode('{	
		"clinicalTrialUSDrug": [{
		"id": 104162,
		"trialNumber": "'.$trialNumber_create.'",
		"substanceKey": "'.$substanceKey1.'",
		"substanceKeyType": "UUID"
	}
	]}');
	
	
	# $decoded->{primaryCompletionDate} = '12/1/2019';
	# $decoded->{completionDate} = '12/1/2019'; 	
	
	# $decoded->{internalVersion} = 3; 	
	$decoded->{clinicalTrialUSDrug} = $ctd->{clinicalTrialUSDrug}; 	
	# print $json->encode($decoded);
	# exit;
	
	my $condition = sub { 
		my $decoded = shift;
		return (defined($decoded->{trialNumber}) && $decoded->{trialNumber} eq $trialNumber_create && $decoded->{recruitment} eq 'XXXX'); 
	};
	my $args = {
		expected_status => 200, 
		data => $decoded,
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialsus",
		condition => $condition,
		message => $message
	};
	test_put($args);
}



{
    
	my $message = 'Test put - Update again by adding one ct drug';
	my $data_string = get_to_json($trialNumber_create);
	
	my $decoded = $json->decode($data_string);
	$decoded->{recruitment} = 'XXXX';
	
	
	my $ctd = $json->decode('{
		"clinicalTrialUSDrug": [{
		"id": 104162,
		"trialNumber": "'.$trialNumber_create.'",
		"substanceKey": "'.$substanceKey1.'",
		"substanceKeyType": "UUID"
	},{
		"trialNumber": "'.$trialNumber_create.'",
		"substanceKey": "'.$substanceKey2.'",
		"substanceKeyType": "UUID"		
	}
	]}');
	$decoded->{clinicalTrialUSDrug} = $ctd->{clinicalTrialUSDrug}; 	
	
	
	my $condition = sub { 
		my $decoded = shift;
		return (defined($decoded->{trialNumber}) && $decoded->{trialNumber} eq $trialNumber_create && $decoded->{recruitment} eq 'XXXX'); 
	};

	my $args = {
		expected_status => 200, 
		data => $decoded, 
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialsus",
		condition => $condition,
		message => $message
	};
	test_put($args);
}



# Get the record, then update the substanceKeys to something completely different, note these ctdrugs don't have ids, so old rows should be deleted and new rows with new ids created.  

{
	my $message = 'Test put -- Get the record, then update the substanceKeys to something different.';
	my $data_string = get_to_json($trialNumber_create);
	
	my $decoded = $json->decode($data_string);


	my $ctd = $json->decode('{
	"clinicalTrialUSDrug": [{
		"trialNumber": "'.$trialNumber_create.'",
		"substanceKey": "'.$substanceKey3.'",
		"substanceKeyType": "UUID"		
	},{
		"trialNumber": "'.$trialNumber_create.'",
		"substanceKey": "'.$substanceKey4.'",
		"substanceKeyType": "UUID"		
	}
	]}');
	$decoded->{clinicalTrialUSDrug} = $ctd->{clinicalTrialUSDrug}; 	
	
	

	my $condition = sub { 
		my $decoded = shift;
		return (defined($decoded->{trialNumber}) && $decoded->{trialNumber} eq $trialNumber_create && $decoded->{recruitment} eq 'XXXX'
		and ($decoded->{clinicalTrialUSDrug}->[0]->{substanceKey} eq $substanceKey3 or $decoded->{clinicalTrialUSDrug}->[1]->{substanceKey} eq $substanceKey3)
		
		); 
	};
	
	my $args = {
		expected_status => 200, 
		data => $decoded,
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialsus",
		condition => $condition,
		message => $message
	};
	test_put($args);
}




# delete the post just created.
# delete_helper($trialNumber_create);


sub test_get {
	print "== begin test ==\n";
    my $args = shift;
	$client->addHeader('Content-Type', 'application/x-www-form-urlencoded');
	$client->GET($args->{url});
	my $response_content = $client->responseContent();
	dump_response_content($response_content, $args);
	my $decoded = $json->decode($response_content);
    dump_response_perl_data($decoded, $args);
	ok($args->{condition}($decoded), $args->{message});
	my $rc = $client->responseCode();
	my $expected = $args->{expected_status};
	ok($client->responseCode() == $args->{expected_status}, "Status matched expected_status. EC: $expected / RC: $rc");
	print "== end test ==\n";
}

sub test_post {
	print "== begin test ==\n";
    my $args = shift;
	$client->addHeader('Accept', 'application/json');
	$client->addHeader('Content-Type', 'application/json');

    my $request_json = $json->encode($args->{data});
	dump_request_content($request_json, $args);
		
	$client->POST($args->{url}, $request_json);
	my $response_content = $client->responseContent();
	dump_response_content($response_content, $args);
	
		my $decoded;
	try { 
		$decoded = $json->decode($client->responseContent());
	} catch {
		print "!!! Decoding json FAILED !!!\n";
	};	
	
	dump_request_perl_data($decoded, $args);

	ok($args->{condition}($decoded), $args->{message});
	my $rc = $client->responseCode();
	my $expected = $args->{expected_status};
	ok($client->responseCode() == $args->{expected_status}, "Status matched expected_status. EC: $expected / RC: $rc");
	print "== end test ==\n";
}

sub test_put {
	print "== begin test ==\n";
    my $args = shift;
	# print $json->encode($args->{data});
	$client->addHeader('Accept', 'application/json');
	$client->addHeader('Content-Type', 'application/json');	

	my $request_json = $json->encode($args->{data});
	dump_request_content($request_json, $args);	

	$client->PUT($args->{url}, $request_json);
	my $response_content = $client->responseContent();
	if(!$response_content) { print "Content is empty\n"; }
	dump_response_content($response_content, $args);	
	my $decoded;
	try { 
		$decoded = $json->decode($client->responseContent());
	} catch {
		print "!!! Decoding json FAILED !!!\n";
	};	
    dump_response_perl_data($decoded, $args);	
	
	my $rc = $client->responseCode();
	my $expected = $args->{expected_status};
	ok($client->responseCode() == $args->{expected_status}, "Status matched expected_status. EC: $expected / RC: $rc");		
	ok($args->{condition}($decoded), $args->{message});
	print "== end Test ===\n";

}


sub test_delete {
	print "== begin test ==\n";
    my $args = shift;
	$client->addHeader('Content-Type', 'application/x-www-form-urlencoded');

	$client->DELETE($args->{url});
	my $response_content = $client->responseContent();
	dump_response_content($response_content, $args);
    my $decoded = $json->decode($response_content);
    dump_response_perl_data($decoded, $args);

	ok($args->{condition}($decoded), $args->{message});
	my $rc = $client->responseCode();
	my $expected = $args->{expected_status};
	ok($client->responseCode() == $args->{expected_status}, "Status matched expected_status. EC: $expected / RC: $rc");
	print "== end test ==\n";
}

# Danny on successful delete there is no JSON message returned. 
# Danny deleting a substance that does not exist returns 500 which is probably not right. {"message":"No class gov.nih.ncats.gsrsspringcv2.ClinicalTrialUS entity with id NCT99999999 exists!","status":500}

sub delete_helper { 
	print "== begin helper ==\n";
    my $trialNumber = shift;
	my $dump = 1;
	$client->addHeader('Accept', 'application/json');
	$client->addHeader('Content-Type', 'application/x-www-form-urlencoded');
	$client->DELETE("$basePath/clinicaltrialsus/$trialNumber");
	if($client->responseContent()) {
		print $client->responseContent();
		my $decoded = $json->decode($client->responseContent());
		print Data::Dumper->Dump([\$decoded]) if ($dump);
		# ok(defined($decoded->{deleted}) && $decoded->{deleted} eq 'true', 'Delete helper.');
	} else { 
		print "No reponse content !!!!\n";
	}
	my $rc = $client->responseCode();
	my $expected = 204;
	ok($client->responseCode() == 204, "Status matched expected_status. EC: $expected / RC: $rc");
	print "== end helper ==\n";
}

sub get_to_json { 
    my $trialNumber=shift;
	my $dump=1;
	$client->addHeader('Accept', 'application/json');
	$client->addHeader('Content-Type', 'application/x-www-form-urlencoded');
	# print "URL: $basePath/clinicaltrialsus($trialNumber)\n";
	$client->GET("$basePath/clinicaltrialsus($trialNumber)");
	return $client->responseContent();
}

#		dump_request_content => 0, 
#		dump_request_perl_data => 0, 
#		dump_response_content => 0, 	
#		dump_response_perl_data => 0, 


sub dump_request_content { 
	my $request_content = shift;
	my $args = shift;
	print "\n  === request_content ====\n".$request_content."\n   ====\n" if($args->{dump_request_content});
}
sub dump_response_content { 
	my $response_content = shift;
	my $args = shift;
	print "\n  === response_content ====\n".$response_content."\n   ====\n" if($args->{dump_response_content});
}

sub dump_request_perl_data {
    my $decoded = shift;
	my $args = shift;
	print "\n  === request_perl_data ====\n".Data::Dumper->Dump([\$decoded])."\n   ====\n" if($args->{dump_request_perl_data});
}
sub dump_response_perl_data {
    my $decoded = shift;
	my $args = shift;
	print "\n  === response_perl_data ====\n".Data::Dumper->Dump([\$decoded])."\n   ====\n" if($args->{dump_response_perl_data});
}



__END__
