use warnings;
use JSON;
binmode(STDOUT, ":encoding(UTF-8)");

# Optionally, provide a list of uuids via pipe
# Then for each uuid, get substance class and substance name from substances in an extracted  gsrs file.

# cat uuid-list.txt | perl get-substance-info-from-gsrs-file.pl filename.gsrs  > substance-info.txt

# if uuid column is column 2
# cat uuid-list.txt | awk '{print $2}' | perl get-substance-info-from-gsrs-file.pl filename.gsrs > substance-info.txt

# if you want the listing for all substances, don't pipe in a list.
# perl get-substance-info-from-gsrs-file.pl filename.gsrs > substance-info.txt

# ===

my $filename=$ARGV[0];
my $has_stdin=0;

my %hash;
if (-t STDIN) {
    $has_stdin=1;
    while (<>) {
        chomp;
        $hash{$_}=1;
    }
}
open(my $unzipped_gsrsfile, "gunzip -c $filename |") or die "Problems with gunzip or file: $filename: $!";

dispatch();

sub get_display_name {
    my $names = shift;
    for my $name (@$names) {
       return $name->{name} if($name->{displayName});
    }
}

sub do_list_piped() { 
    while (<$unzipped_gsrsfile>) {
        chomp;
        my $ps = decode_json($_);
        if ($hash{$ps->{uuid}}) {
            print join("\t", $ps->{uuid}, $ps->{substanceClass}, get_display_name($ps->{names}))."\n";
        }
    }
}

sub do_list_all() { 
    while (<$unzipped_gsrsfile>) {
        chomp;
        my $ps = decode_json($_);
        print join("\t", $ps->{uuid}, $ps->{substanceClass}, get_display_name($ps->{names}))."\n";
    }
}

sub dispatch {
    if ($has_stdin) {
        do_list_piped();
    } else {
        do_list_all();
    }
}
