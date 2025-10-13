import { useState } from "react";
import {
  Send,
  Star,
  Heart,
  MessageCircle,
  CheckCircle,
  User,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface FeedbackData {
  email: string;
  name: string;
  message: string;
  rating: number;
}

export default function Feedback() {
  const [formData, setFormData] = useState<FeedbackData>({
    email: "",
    name: "",
    message: "",
    rating: 0,
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handleRatingHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

      // Validate required fields
      if (!formData.email.trim() || !formData.message.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in your email and feedback message.",
          variant: "destructive",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        email: formData.email.trim(),
        name: formData.name.trim() || null,
        message: formData.message.trim(),
        rating: formData.rating || null,
      };

      const response = await fetch(`${baseUrl}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: "Failed to submit feedback" }));
        throw new Error(error.detail || "Failed to submit feedback");
      }

      setIsSubmitted(true);
      toast({
        title: "Feedback Submitted!",
        description:
          "Thank you for your valuable feedback. We appreciate your time!",
      });

      // Reset form
      setFormData({
        email: "",
        name: "",
        message: "",
        rating: 0,
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || formData.rating);

      return (
        <button
          key={index}
          type="button"
          className="p-1 transition-colors duration-200"
          onClick={() => handleRatingClick(starValue)}
          onMouseEnter={() => handleRatingHover(starValue)}
          onMouseLeave={handleRatingLeave}
        >
          <Star
            className={`h-8 w-8 ${
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            } transition-colors duration-200`}
          />
        </button>
      );
    });
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              Thank You!
            </CardTitle>
            <CardDescription className="text-lg">
              Your feedback has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              We truly appreciate you taking the time to share your experience
              with us. Your feedback helps us improve and make our platform
              better for everyone.
            </p>
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Submit Another Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <Heart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Share Your Experience
        </h1>
        <p className="text-lg text-muted-foreground">
          We'd love to hear about your experience using our platform. Your
          feedback helps us improve and serve you better.
        </p>
      </div>

      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Tell Us About Your Experience
          </CardTitle>
          <CardDescription>
            Help us understand how we can make your experience even better
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Name (Optional)
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            {/* Rating Field */}
            <div className="space-y-2">
              <Label>How would you rate your overall experience?</Label>
              <div className="flex items-center gap-2">
                {renderStars()}
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.rating > 0 && (
                    <>
                      {formData.rating} star
                      {formData.rating !== 1 ? "s" : ""} -
                      {formData.rating === 1 && " Poor"}
                      {formData.rating === 2 && " Fair"}
                      {formData.rating === 3 && " Good"}
                      {formData.rating === 4 && " Very Good"}
                      {formData.rating === 5 && " Excellent"}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Tell us more about your experience *
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="What did you like? What could we improve? Any suggestions?"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.email.trim() ||
                !formData.message.trim()
              }
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Your feedback is anonymous and will be used solely to improve our
          platform.
        </p>
      </div>
    </div>
  );
}
