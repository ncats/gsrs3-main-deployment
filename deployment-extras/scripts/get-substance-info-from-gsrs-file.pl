use warnings;
use JSON;
# binmode(STDOUT, ":encoding(UTF-8)");

# This script, helps one pull out information from substances within a ".gsrs" file. 

# Optionally, provide a list of uuids via pipe
# Then for each uuid, get substance class and substance name from substances in an extracted gsrs file.

# cat uuid-list.txt | perl get-substance-info-from-gsrs-file.pl filename.gsrs piped  > substance-info.txt

# if uuid column is column 2
# cat uuid-list.txt | awk '{print $2}' | perl get-substance-info-from-gsrs-file.pl filename.gsrs piped > substance-info.txt

# if you want the listing for ALL substances, don't pipe in a list.
# perl get-substance-info-from-gsrs-file.pl filename.gsrs > substance-info.txt

# ===

my $filename=$ARGV[0];
my $piped=$ARGV[1]||'';
my $has_piped_data=0;
if ($piped eq 'piped') {
  $has_piped_data=1;
}
my %hash;
if ($has_piped_data) {
while(my $line = <STDIN>) {
        chomp($line);
        $hash{$line}=1;
    }
}
# print $has_piped_data;
# exit;

open(my $unzipped_gsrsfile, "gunzip -c $filename |") or die "Problems with gunzip or file: $filename: $!";

dispatch();

sub get_display_name {
    my $names = shift;
    for my $name (@$names) {
       return $name->{name} if($name->{displayName});
    }
}

sub do_list_piped { 
    while (<$unzipped_gsrsfile>) {
        chomp;
        my $ps = decode_json($_);
        # my $ps = from_json($_);
        if ($hash{$ps->{uuid}}) {
            # print ("$_\n");
            print join("\t", $ps->{uuid}, $ps->{substanceClass}, get_display_name($ps->{names}))."\n";
        }
    }
}

sub do_list_all { 
    while (<$unzipped_gsrsfile>) {
        chomp;
        # my $ps = from_json($_);
        my $ps = decode_json($_);
        # print ("$_\n");
        print join("\t", $ps->{uuid}, $ps->{substanceClass}, get_display_name($ps->{names}))."\n";
    }
}


sub test {
    while (<$unzipped_gsrsfile>) {
        chomp;
        my $ps = decode_json($_);
        print encode_json($ps)."\n";
    }
}

sub dispatch {
    if ($has_piped_data) {
        do_list_piped();
    } else {
        do_list_all();
    }
}

