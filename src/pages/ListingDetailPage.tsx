import { useListing } from "@/features/listings/hooks/useListing";
import { data, useParams } from "react-router-dom";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListing(id!);
  console.log(listing);
  return <h1>Listing Details</h1>;
}
