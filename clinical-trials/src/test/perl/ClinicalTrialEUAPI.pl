use strict;
use warnings;
use Test::More;
use 5.10.0;
use Data::Dumper;
use REST::Client;
use JSON;
use Try::Tiny;

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



my $trialNumber_get = '2004-000029-31-IE';
my $trialNumber_ne = '2199-000000-00-ZZ';
my $trialNumber_create = '2004-000457-34-HU';
my $trialNumber_delete = $trialNumber_create;

my $substanceKey_ne = '3345eae8-2d84-4a19-acf7-x6xx3xx022x5';  # made up uuid
my $substanceKey1;
my $substanceKey2;
my $substanceKey3;
my $substanceKey4;



# These substances have to exists and be indexed to work!!!!!
# These ones are in the ncts repo90.ginas test data set
if($substance_data_source eq 'rep4.gsrs') {
  $substanceKey1="1cf410f9-3eeb-41ed-ab69-eeb5076901e5"; # "ALFERMINOGENE TADENOVEC DNA SEQUENCE"
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
      "trialNumber": "TRIALNUMBER",
      "title": "A MULTICENTRE, RANDOMISED, OPEN CLINICAL STUDY TO COMPARE THE EFFICACY AND SAFETY OF A COMBINATION THERAPY OF TACROLIMUS WITH SIROLIMUS VERSUS TACROLIMUS WITH MYCOPHENOLATE MOFETIL IN KIDNEY TRANSPLANTATION",
      "sponsorName": "Fujisawa GmbH",
      "trialStatus": "Completed",
      "dateFirstEnteredDb": 1598241600000,
      "nationalCompetentAuthority": "Hungary - National Institute of Pharmacy",
      "competentAuthorityDecision": "Authorised",
      "competentAuthorityDecisionDate": 1603080000000,
      "ethicsComOpinionApp": "Favourable",
      "ethicsComOpinionDate": 1601956800000,
      "country": "HU",
      "url": "https://www.clinicaltrialsregister.eu/ctr-search/trial/2004-000457-34/HU"
	  ,
      "clinicalTrialEuropeMedicalList": [
        {
          "id": 456,
          "medicalCondInvesigated": "Patients with end stage kidney disease who will undergo primary renal transplantation or retransplantation. |"
        }
      ],
      "clinicalTrialEuropeMeddraList": [
        {
          "id": 253,
          "meddraVersion": "7.0",
          "meddraClassCode": "10014646"
        }
      ],
      "clinicalTrialEuropeProductList": [
        {
          "id": 1,	  
		  "impSection": "impSection1",
		  "productName": "productName1",
		  "tradeName": "tradeName1",
		  "impRole": "impRole1",
		  "impRoutesAdmin": "impRoutesAdmin1",
		  "pharmaceuticalForm": "pharmaceuticalForm1",
		  "prodIngredName": "prodIngredName1",
		  "clinicalTrialEuropeDrugList": [{
			"id": 10,
			"product_id": 1,
            "substanceKey": "'. $substanceKey1 .'",
            "substanceKeyType": "UUID"		  
		  },		  
		  {
			"id": 11,  
			"product_id": 1,
            "substanceKey": "'. $substanceKey2 .'",
            "substanceKeyType": "UUID"
		  } 
		  ]
        }
      ]
	}';


$base_json =~ s/TRIALNUMBER/2004-000457-34-HU/g;
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
		url => "$basePath/clinicaltrialseurope/$trialNumber_ne",
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
		url => "$basePath/clinicaltrialseurope",
		condition => $condition,
		message => $message
	};
	
	test_get($args);
}


{	
	
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
	    url => "$basePath/clinicaltrialseurope",
		condition => $condition,
		message => $message
	};	
	test_post($args);
}


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
		url => "$basePath/clinicaltrialseurope",
		condition => $condition,
		message => $message
	};
	
	test_get($args);
}


{
	my $message = 'Test put - Update the record just created changing sponsorName value.';
	my $data_string = get_to_json($trialNumber_create);
	my $decoded = $json->decode($data_string);
	$decoded->{sponsorName} = 'XXXX';	
	my $condition = sub { 
		my $decoded = shift;
		return (defined($decoded->{trialNumber}) && $decoded->{trialNumber} eq $trialNumber_create && $decoded->{sponsorName} eq 'XXXX'); 
	};
	my $args = {
		expected_status => 200, 
		data => $decoded,
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialseurope",
		condition => $condition,
		message => $message
	};
	test_put($args);
}

# exit;
{    
    my $message = 'Test put - Try to update with change one substance uuid';
	my $data_string = get_to_json($trialNumber_create);

	my $decoded = $json->decode($data_string);
	# $decoded->{recruitment} = 'XXXX';
	# $decoded->{gsrsUpdated} = 0;
	
	my $ctds = $decoded->{clinicalTrialEuropeProductList}->[0]->{clinicalTrialEuropeDrugList};	

	pop(@{$ctds}); 

    push @{$ctds}, 	
		  {
			"product_id"=> 1,
            "substanceKey"=> $substanceKey3,
            "substanceKeyType"=> "UUID"
		  }
		  ;
	
	$decoded->{clinicalTrialEuropeProductList}->[0]->{clinicalTrialEuropeDrugList} = $ctds; 	
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
		url => "$basePath/clinicaltrialseurope",
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
	my $ctds = [];
	
	pop(@{$ctds}); 

    push @{$ctds}, 	
		  {
			"product_id"=> 1,
            "substanceKey"=> $substanceKey1,
            "substanceKeyType"=> "UUID"
		  };
    push @{$ctds}, 	
		  {
			"product_id"=> 1,
            "substanceKey"=> $substanceKey1,
            "substanceKeyType"=> "UUID"
		  };
	
	
	
	
	$decoded->{clinicalTrialEuropeProductList}->[0]->{clinicalTrialEuropeDrugList} = $ctds; 	

	# print $json->encode($decoded);
	my $condition = sub { 
		my $decoded = shift;
		if(defined($decoded->{validationMessages})) {
			for my $vm (@{$decoded->{validationMessages}}) {
				# this needs to be addressed in GSRS or CT starter. The duplication error message is not coming back on fail.
				if( $vm->{message} and $vm->{message} =~ /Transaction silently rolled back/i) {
					return 1;
				}
			}		
		}
		if(defined($decoded->{message})) {
			if( $decoded->{message} =~ /Transaction silently rolled back/i) {
					return 1;	
			}		
		}
		
		
		
	};
	my $args = {
		expected_status => 500, 
		data => $decoded,
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialseurope",
		condition => $condition,
		message => $message
	};
	test_put($args);
}


{    
    my $message = "Test PUT - Update a record that does not exist.";
	my $data_string = get_to_json($trialNumber_create);
	$data_string =~ s/$trialNumber_create//g;
	my $decoded = $json->decode($data_string);
	$decoded->{trialNumber} = $trialNumber_ne;
	my $condition = sub { 
		my $decoded = shift;		
		# return (defined($decoded->{message}) && $decoded->{message} =~ /No value present/i);
		# needs to be addressed		
		return (defined($decoded->{message}) && $decoded->{message} =~ /Transaction silently rolled back/i);
	};
	my $args = {
		expected_status => 500, 
		data => $decoded,
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialseurope",
		condition => $condition,
		message => $message
	};
	test_put($args);
}


{    
		
    my $message = "Test put - Update again with a changed sponsorName value but change the clinicalTrialEuropeDrug Object by removing one ct drug.";
	my $data_string = get_to_json($trialNumber_create);
	my $decoded = $json->decode($data_string);
	$decoded->{recruitment} = 'XXXX';

	my $ctds = $decoded->{clinicalTrialEuropeProductList}->[0]->{clinicalTrialEuropeDrugList};	
   # my $ctd_before_count = scalar(@$ctds);
   # die "expecting greater than zero ctd_before_count\n" if (!($ctd_before_count gt 0)); 
	pop(@{$ctds}); 
   # my $ctd_before_after = scalar(@$ctds);
	
	$decoded->{clinicalTrialEuropeProductList}->[0]->{clinicalTrialEuropeDrugList} = $ctds; 	

	
	my $condition = sub { 
		my $decoded = shift;
		return (defined($decoded->{trialNumber}) && $decoded->{trialNumber} eq $trialNumber_create && $decoded->{sponsorName} eq 'XXXX'
		# && scalar(@{$decoded->{clinicalTrialEuropeProductList}->[0]->{clinicalTrialEuropeDrugList}}) gt 0 
		); 
	};
	my $args = {
		expected_status => 200, 
		data => $decoded,
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 0, 
		url => "$basePath/clinicaltrialseurope",
		condition => $condition,
		message => $message
	};
	test_put($args);
}




{
    
	my $message = 'Test put - Update again by adding one ctd with an id and adding one without an id';
	my $data_string = get_to_json($trialNumber_create);
	
	my $decoded = $json->decode($data_string);
	$decoded->{sponsorName} = 'XXXX';
	
	
	my $plist = $json->decode('
	{  
      "clinicalTrialEuropeProductList": [
        {
          "id": 1,	  
		  "impSection": "impSection1",
		  "productName": "productName1",
		  "tradeName": "tradeName1",
		  "impRole": "impRole1",
		  "impRoutesAdmin": "impRoutesAdmin1",
		  "pharmaceuticalForm": "pharmaceuticalForm1",
		  "prodIngredName": "prodIngredName1",
		  "clinicalTrialEuropeDrugList": [
		  {
			"id": 10,
			"product_id": 1,
            "substanceKey": "'. $substanceKey1 .'",
            "substanceKeyType": "UUID"		  
		  },		  
		  {
			"id": 11,  
			"product_id": 1,
            "substanceKey": "'. $substanceKey2 .'",
            "substanceKeyType": "UUID"
		  },
		  {
			"product_id": 1,
            "substanceKey": "'. $substanceKey3 .'",
            "substanceKeyType": "UUID"
		  } 	  
		  ]
	    }		
      ]
	 }
	');
	$decoded->{clinicalTrialEuropeProductList} = [];
	$decoded->{clinicalTrialEuropeProductList} = $plist->{clinicalTrialEuropeProductList}; 	
	
	
	my $condition = sub { 
		my $decoded = shift;
		return (defined($decoded->{trialNumber}) && $decoded->{trialNumber} eq $trialNumber_create && $decoded->{sponsorName} eq 'XXXX' &&
		scalar(@{$decoded->{clinicalTrialEuropeProductList}->[0]->{clinicalTrialEuropeDrugList}}) == 3
		); 
	};

	my $args = {
		expected_status => 200, 
		data => $decoded, 
		dump_request_content => 0, 
		dump_request_perl_data => 0, 
		dump_response_content => 1, 	
		dump_response_perl_data => 1, 
		url => "$basePath/clinicaltrialseurope",
		condition => $condition,
		message => $message
	};
	test_put($args);
}



{
	my $message = 'Test put -- Get the record, then update the substanceKeys to associate with a different product id';
	my $data_string = get_to_json($trialNumber_create);
	
	my $decoded = $json->decode($data_string);

	my $ctds = [];
	
    push @{$ctds}, 	
		  {
			"product_id"=> 98,
            "substanceKey"=> $substanceKey4,
            "substanceKeyType"=> "UUID"
		  };
    push @{$ctds}, 	
		  {
			"product_id"=> 99,
            "substanceKey"=> $substanceKey3,
            "substanceKeyType"=> "UUID"
		  };
	
	
	$decoded->{clinicalTrialEuropeProductList}->[0]->{clinicalTrialEuropeDrugList} = $ctds; 	
	


	my $condition = sub { 
		my $decoded = shift;
		return (
		defined($decoded->{trialNumber}) 
		&& $decoded->{trialNumber} eq $trialNumber_create
		&& defined($decoded->{clinicalTrialEuropeProductList}->[1]->{id})
        && $decoded->{clinicalTrialEuropeProductList}->[1]->{id} == 98
		&& $decoded->{clinicalTrialEuropeProductList}->[1]->{clinicalTrialEuropeDrug}->[0]->{substanceKey} eq $substanceKey4 
		); 
	};
	
	my $args = {
		expected_status => 200, 
		data => $decoded,
		dump_request_content => 1, 
		dump_request_perl_data => 0, 
		dump_response_content => 0, 	
		dump_response_perl_data => 1, 
		url => "$basePath/clinicaltrialseurope",
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
	my $decoded = $json->decode($response_content);
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


sub delete_helper { 
	print "== begin helper ==\n";
    my $trialNumber = shift;
	my $dump = 1;
	$client->addHeader('Accept', 'application/json');
	$client->addHeader('Content-Type', 'application/x-www-form-urlencoded');
	$client->DELETE("$basePath/clinicaltrialseurope/$trialNumber");
	if($client->responseContent()) {
		print $client->responseContent();
		my $decoded = $json->decode($client->responseContent());
		print Data::Dumper->Dump([\$decoded]) if ($dump);
		# ok(defined($decoded->{deleted}) && $decoded->{deleted} eq 'true', 'Delete helper.');
	} else { 
		print "No reponse content !!!!\n";
	}
	my $rc = $client->responseCode();
	my $expected = 200;
	ok($client->responseCode() == 200, "Status matched expected_status. EC: $expected / RC: $rc");
	print "== end helper ==\n";
}

sub get_to_json { 
    my $trialNumber=shift;
	my $dump=1;
	$client->addHeader('Accept', 'application/json');
	$client->addHeader('Content-Type', 'application/x-www-form-urlencoded');
	# print "URL: $basePath/clinicaltrialseurope/$trialNumber\n";
	$client->GET("$basePath/clinicaltrialseurope/$trialNumber");
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
